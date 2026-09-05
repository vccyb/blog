---
title: Agent 005 - Write and Edit Tools
subtitle: From Zero to Master · 从整文件覆写到锚定式精准替换
description: 给 Agent 补上写能力：write tool 沿用 safe 围栏整文件落盘；edit tool 用 old_content/new_content 做锚定替换，找不到、唯一、多处三种情况各有各的契约。
tags:
  - agent学习专栏
pubDate: 2026-09-06
---

## 学习材料与技术栈

学习的材料主要来源于

> 1. [learn.shareai.run](https://learn.shareai.run/zh/)
> 2. 构建的学习Agent + GLM 3
> 3. Claude code 官方的文档于一些教程

主要采用TS进行体验

## 学习

有了 read tool，Agent 能"看"了；但要能干活，还得能"改"。这一期补上写能力，分两个工具：

- **write tool** —— 整文件覆写，适合新建文件或者大改
- **edit tool** —— 锚定式精准替换，只动想动的那一小段

为什么要分两个？因为只有 write 是不行的：假设你只想修改几行，write 会把整个文件完整重写一遍，这里会非常消耗 token。改一处 = 重读全文 + 重写全文，账算不过来。

## 实战

### 1. write tool

write 直接使用 `writeFileSync` 这个 API，落盘前沿用 read tool 的围栏逻辑（`resolve` + `startsWith`）。对 write 来说这道围栏更重要——读出去是信息泄露，写出去就是破坏性操作了：

```ts title="tools.ts"
export const write_handler = (args: Record<string, unknown>) => {
  const file = args?.file;
  const content = args?.content;

  const isArgsError =
    file === undefined ||
    typeof file !== "string" ||
    content === undefined ||
    typeof content !== "string";

  if (isArgsError) {
    throw new ToolArgsError(`args error ${JSON.stringify(args)}`);
  }

  const safeFilePath = resolve(Root, file);
  if (!safeFilePath.startsWith(Root)) {
    throw new Error(
      `file ${safeFilePath} is outside of the allowed directory, your input path: ${file}, resolved safe path: ${safeFilePath}`,
    );
  }

  try {
    writeFileSync(safeFilePath, content, {
      encoding: "utf-8",
    });
    return `Successfully wrote to file ${file}, content length: ${content.length}`;
  } catch (error) {
    throw new Error(
      `Failed to write to file ${file}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const write_tool: Tool = {
  name: "write_tool",
  description: "Write to a file",
  input_schema: {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "The file to write to",
      },
      content: {
        type: "string",
        description: "The content to write",
      },
    },
    required: ["file", "content"],
  },
};
```

一个细节：成功信息里带上了 `content length`，让模型知道这次实际写进去了多少，作为一次有效的观察。

### 2. write 的 UT

```ts title="tools.test.ts"
describe("write_handler", () => {
  test("should write to a file", () => {
    const filePath = "./test_write.txt";
    const content = "Hello, world!";
    const result = write_handler({ file: filePath, content });
    expect(result).toContain("Successfully wrote to file");

    expect(() => read_handler({ file: filePath })).not.toThrow();
    const readContent = read_handler({ file: filePath });
    expect(readContent).toBe(content);

    // Clean up
    if (existsSync(resolve(Root, filePath))) {
      rmSync(resolve(Root, filePath));
    }
  });

  test("should throw an error for invalid arguments", () => {
    expect(() => write_handler({})).toThrowError(/args error/);
    expect(() => write_handler({ file: 123, content: "test" })).toThrowError(
      /args error/,
    );
    expect(() =>
      write_handler({ file: "./test_write.txt", content: 123 }),
    ).toThrowError(/args error/);
  });

  test("should throw an error for path escaping workspace", () => {
    expect(() =>
      write_handler({ file: "../../ROADMAP.md", content: "test" }),
    ).toThrowError(/is outside of the allowed directory/);
  });
});
```

### 3. edit tool 的设计

edit tool 实际上会复杂一些。设计上的约定大概是这样：

```json
{
  "file": "tasks.md",
  "old_content": "2. 写作业",
  "new_content": "2. 交作业"
}
```

`old_content` 是我要改的那一小段**原文**（锚），`new_content` 是改完之后的样子。

关键在于：`old_content` 在真实文件里可能有三种情况，每种要有不同的契约：

1. **找不到** —— 直接报错就好，让 LLM 继续（可能是它记错了原文）
2. **唯一** —— 进行替换
3. **多处** —— 这种就应该返回对应的信息给到 LLM，让 LLM 自己确定怎么处理（比如带上更多上下文重新锚定），而不是替它做决定

### 4. edit 的实现

```ts title="tools.ts"
export const edit_handler = (args: Record<string, unknown>) => {
  const file = args?.file;
  const old_content = args?.old_content;
  const new_content = args?.new_content;

  const isArgsError =
    file === undefined ||
    typeof file !== "string" ||
    old_content === undefined ||
    typeof old_content !== "string" ||
    new_content === undefined ||
    typeof new_content !== "string";

  if (isArgsError) {
    throw new ToolArgsError(`args error ${JSON.stringify(args)}`);
  }

  const safeFilePath = resolve(Root, file);
  if (!safeFilePath.startsWith(Root)) {
    throw new Error(
      `file ${safeFilePath} is outside of the allowed directory, your input path: ${file}, resolved safe path: ${safeFilePath}`,
    );
  }

  try {
    // 岔口1：old_content 在原文中找不到
    const originalContent = readFileSync(safeFilePath, { encoding: "utf-8" });
    if (!originalContent.includes(old_content as string)) {
      throw new Error(
        `old_content does not match the original content of the file ${file}`,
      );
    }

    // 岔口2：出现次数 > 1（不唯一）
    const occurrences = originalContent.split(old_content as string).length - 1;
    if (occurrences > 1) {
      throw new Error(
        `old_content matches multiple times in the original content of the file ${file}`,
      );
    }

    // 唯一命中 → 替换落盘
    const newContent = originalContent.replace(
      old_content as string,
      new_content as string,
    );
    writeFileSync(safeFilePath, newContent, { encoding: "utf-8" });
    return `Successfully edited file ${file}`;
  } catch (error) {
    throw new Error(
      `Failed to edit file ${file}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const edit_tool: Tool = {
  name: "edit_tool",
  description:
    "Edit a file Each edits[].oldText must match a unique, non-overlapping region of the original file.",
  input_schema: {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "The file to edit",
      },
      old_content: {
        type: "string",
        description: "The old content of the file",
      },
      new_content: {
        type: "string",
        description: "The new content to write to the file",
      },
    },
    required: ["file", "old_content", "new_content"],
  },
};
```

设计的三种情况正好对应实现里的三个岔口：`includes` 判断找不到，`split` 计数判断多处，都过了才 `replace` + `writeFileSync`。到处处匹配就全替换的做法被刻意排除了——静默全替换风险太大，把选择权还给模型。

小注：`edit_tool` 的 description 是参考官方 edit 工具的描述写的（那边支持 `edits[]` 数组批量替换），我们这版先做单次替换，把"唯一性"这个核心契约跑通。

### 5. edit 的 UT

```ts title="tools.test.ts"
describe("edit_handler", () => {
  test("should throw an error for path escaping workspace", () => {
    expect(() =>
      edit_handler({
        file: "../../ROADMAP.md",
        old_content: "test",
        new_content: "test",
      }),
    ).toThrowError(/is outside of the allowed directory/);
  });

  test("should throw an error for invalid arguments", () => {
    expect(() => edit_handler({})).toThrowError(/args error/);
    expect(() =>
      edit_handler({ file: 123, old_content: "test", new_content: "test" }),
    ).toThrowError(/args error/);
    expect(() =>
      write_handler({ file: "./test_write.txt", content: 123 }),
    ).toThrowError(/args error/);
  });

  // 找不到
  test("should throw an error for content mismatch", () => {
    const filePath = "./test_write.txt";
    const content = "Hello, world!";
    write_handler({ file: filePath, content });

    expect(() =>
      edit_handler({
        file: filePath,
        old_content: "Different content",
        new_content: "New content",
      }),
    ).toThrowError(
      /old_content does not match the original content of the file .*/,
    );

    // Clean up
    if (existsSync(resolve(Root, filePath))) {
      rmSync(resolve(Root, filePath));
    }
  });

  // 多处
  test("should throw an error when old_content matches multiple times", () => {
    const filePath = "./test_write.txt";
    const content = "Hello, world! Hello, world!";
    write_handler({ file: filePath, content });

    const newContent = "Hi, universe!";
    expect(() =>
      edit_handler({
        file: filePath,
        old_content: "Hello, world!",
        new_content: newContent,
      }),
    ).toThrowError(
      /old_content matches multiple times in the original content of the file .*/,
    );

    // Clean up
    if (existsSync(resolve(Root, filePath))) {
      rmSync(resolve(Root, filePath));
    }
  });

  // 唯一命中
  test("should edit the file when old_content matches exactly once", () => {
    const filePath = "./test_write.txt";
    const content = "Hello, world!";
    write_handler({ file: filePath, content });

    const newContent = "Hi, universe!";
    const result = edit_handler({
      file: filePath,
      old_content: "Hello, world!",
      new_content: newContent,
    });
    expect(result).toContain("Successfully edited file ");

    const readContent = read_handler({ file: filePath });
    expect(readContent).toBe(newContent);

    // Clean up
    if (existsSync(resolve(Root, filePath))) {
      rmSync(resolve(Root, filePath));
    }
  });
});
```

UT 同样按三种情况铺满：找不到、多处、唯一命中各一条，外加围栏和参数守卫——契约写死，实现随便重构。
