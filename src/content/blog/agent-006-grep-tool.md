---
title: Agent 006 - Grep Tool
subtitle: From Zero to Master · 带行号的检索，0 匹配不是事故是答案
description: 给 Agent 添加 grep tool：命中行带行号返回、行号是通往 edit/read 的桥梁，0 匹配要体面地说"没有"，而不是当成异常炸出去。
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

read / write / edit 都有了，还差一个"在哪"的问题——文件一长，每次都 read 全文太贵，检索需求就来了。这一期添加 grep tool。

设计原则其实就一句话：**检索的结果要把行号带上**，然后处理好三类场景——match 到的正常场景、match 不到的场景、以及异常场景。

行号为什么重要？它是工具之间的桥梁：模型看到 `42: foo`，下一轮就能拿这个行号去 read 上下文，或者用那一行的原文做 edit 的 `old_content` 锚。没有行号，检索结果只是一堆孤立的文本。

还有一个呼应：003 的表格里我们说过，`grep` 没匹配到时退出 1 是它的"答案"——失败本身就是信息。所以 0 匹配不应该是异常炸出去，而是要体面地返回"没有找到"。

## 实战

### 1. 实现

```ts title="tools.ts"
export const grep_handler = (args: Record<string, unknown>) => {
  const file = args?.file;
  const pattern = args?.pattern;

  const isArgsError =
    file === undefined ||
    typeof file !== "string" ||
    pattern === undefined ||
    typeof pattern !== "string";

  if (isArgsError) {
    throw new ToolArgsError(`args error ${JSON.stringify(args)}`);
  }

  const safeFilePath = resolve(Root, file);
  if (!safeFilePath.startsWith(Root)) {
    throw new Error(
      `file ${safeFilePath} is outside of the allowed directory, your input path: ${file}, resolved safe path: ${safeFilePath}`,
    );
  }

  if (!existsSync(safeFilePath)) {
    throw new Error(
      `file ${safeFilePath} does not exist, your input path: ${file}, resolved safe path: ${safeFilePath}`,
    );
  }

  try {
    const content = readFileSync(safeFilePath, { encoding: "utf-8" });
    const lines = content.split("\n");

    // ① 挂牌：每行带上自己的行号（i 从 0 起，人行从 1 起）
    const numbered = lines.map((line, i) => ({
      no: i + 1,
      line,
    }));

    // ② 筛：命中才留下
    const hits = numbered.filter(({ line }) => line.includes(pattern));

    // ③ 岔口：0 匹配不是事故，是答案——体面地说
    if (hits.length === 0) {
      return `No matches found for "${pattern}" in ${file}`;
    }

    // ④ 摆货：一行一条 "行号: 内容"，尾巴上报总数
    const body = hits.map(({ no, line }) => `${no}: ${line}`).join("\n");
    return `${body}\n共 ${hits.length} 处匹配`;
  } catch (error) {
    throw new Error(
      `Failed to grep file ${file}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const grep_tool: Tool = {
  name: "grep_tool",
  description: "Grep a file",
  input_schema: {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "The file to grep for",
      },
      pattern: {
        type: "string",
        description: "The pattern to grep for",
      },
    },
    required: ["file", "pattern"],
  },
};
```

流程就是四步：**挂牌**（每行带行号）→ **筛**（命中才留）→ **岔口**（0 匹配体面返回）→ **摆货**（`行号: 内容` 一行一条，尾巴上报总数）。

注意 ③ 和真正的异常是分开的：文件不存在、路径越界走 `throw`，那是"事故"；0 匹配走正常返回，那是"答案"。

### 2. UT

```ts title="tools.test.ts"
describe("grep_handler", () => {
  test("带行号返回命中 + 总数", () => {
    const filePath = "./test_write.txt";
    const content = `Hello, world!
This is a test file.
Hello, universe!
Goodbye, world!`;
    write_handler({ file: filePath, content });

    const pattern = "Hello";
    const result = grep_handler({ file: filePath, pattern });
    expect(result).toContain("1: Hello, world!");
    expect(result).toContain("3: Hello, universe!");
    expect(result).toContain("共 2 处匹配");

    // Clean up
    if (existsSync(resolve(Root, filePath))) {
      rmSync(resolve(Root, filePath));
    }
  });

  test("should throw an error for invalid arguments", () => {
    expect(() => grep_handler({})).toThrowError(/args error/);
    expect(() => grep_handler({ file: 123, pattern: "test" })).toThrowError(
      /args error/,
    );
    expect(() =>
      grep_handler({ file: "./test_write.txt", pattern: 123 }),
    ).toThrowError(/args error/);
  });

  test("should throw an error for path escaping workspace", () => {
    expect(() =>
      grep_handler({ file: "../../ROADMAP.md", pattern: "test" }),
    ).toThrowError(/is outside of the allowed directory/);
  });

  test("should throw an error for non-existent file", () => {
    expect(() =>
      grep_handler({ file: "./non_existent_file.txt", pattern: "test" }),
    ).toThrowError(/file .* does not exist/);
  });

  test("match 不到：不报错，返回体面的提示", () => {
    const filePath = "./test_write.txt";
    const content = "Hello, world!";
    write_handler({ file: filePath, content });

    const result = grep_handler({ file: filePath, pattern: "Goodbye" });
    expect(result).toMatch(/No matches found for .*/);

    // Clean up
    if (existsSync(resolve(Root, filePath))) {
      rmSync(resolve(Root, filePath));
    }
  });
});
```

小注：UT 里的断言格式要和 handler 实际返回的格式对齐（`1: 内容` / `共 N 处匹配`）——handler 的返回格式就是契约，早期草稿里断言写的是 `Line 1:` / `Total matches: 2`，跟实现对不上跑起来必挂。这本身就是一次提醒：改返回格式时，UT 是最先报警的那个。

至此，工作空间内最常用的四个文件工具凑齐了：**read / write / edit / grep**，加上万能的 bash，模型对文件系统的基本操作闭环了。
