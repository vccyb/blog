---
title: Agent 004 - Read Tool
subtitle: From Zero to Master · 添加第一个专业工具：安全读文件
description: 与其给模型一把万能钥匙，不如给它几张专用卡片：添加 read tool，补 safe 路径围栏与存在性检查，先越界后不存在的检查顺序，以及 resolve 遇到绝对路径的越界坑。
tags:
  - agent学习专栏
pubDate: 2026-09-05
---

## 学习材料与技术栈

学习的材料主要来源于

> 1. [learn.shareai.run](https://learn.shareai.run/zh/)
> 2. 构建的学习Agent + GLM 3
> 3. Claude code 官方的文档于一些教程

主要采用TS进行体验

## 学习

这一期我们来添加一个专业的 tool：read tool。相较于万能的 bash 工具，让 AI 自己判断使用专门的工具来处理特定的事，会有一定的优势。

**与其给模型一把万能钥匙（bash），不如给它几张专用卡片。**

1. **填表比背咒语不容易错**——卡片上写着要填哪格，填错了马上有人告诉你错哪；bash 得自己拼命令，一个引号写错就翻车。
2. **卡片的回答是整理过的**——只说有用的，不倒垃圾；干砸了也说人话（"这个路径出界了"），模型下一轮自己就能改。bash 一出错就是一堵天书墙。
3. **一张卡只会一件事**——读文件的卡再怎么用也删不了库。就算出错也炸不大，而且哪张卡随便用、哪张卡要审批，一目了然。

bash 不是没用——碰到没卡片的事，还得它上。只是高频的事，值得为它专门做张卡。

## 实战

### 1. 定义基本的 read tool

handler、definition、registry 三件套，先把基本的结构搭出来：

```ts title="tools.ts"
export function read_handler(args: Record<string, unknown>) {
  const file = args?.file;
  const isArgsError = file === undefined || typeof file !== "string";

  if (isArgsError) {
    throw new ToolArgsError(`args error ${JSON.stringify(args)}`);
  }

  try {
    const content = readFileSync(file, { encoding: "utf-8" });
    return content;
  } catch (error) {
    throw new Error(
      `Failed to read file ${file}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export const read_tool: Tool = {
  name: "read_tool",
  description: "Read a file",
  input_schema: {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "The file to read",
      },
    },
    required: ["file"],
  },
};

export const registry: Record<string, ToolUnit> = {
  bash: {
    definition: bash_tool,
    handler: bash_handler,
  },
  read_tool: {
    definition: read_tool,
    handler: read_handler,
  },
};
```

得益于上一节 registry 的设计，这里只是加了一项，agent loop 零修改。

### 2. safe 的要求

基本的结构就有了，但实际上对于 read tool 的场景，还会有 safe 的要求：

1. safe 路径，要求一定在工作空间下
2. 对于不存在的文件，需要提示报错
3. 对于绝对路径这种，我们要提示越界

### 3. 补充一些 UT

先把上面这些要求写死成契约：

```ts title="tools.test.ts"
import { join } from "node:path";
import { read_handler } from "../tools";
import { describe, expect, test } from "bun:test";

// 相对路径是相对 cwd 解析的，不是相对本文件 —— bun test 从 runtime/ 跑时
// "../../TASK.md" 会指到 stages/ 下。锚定 import.meta.dir 才与运行目录无关。
// const TASK_MD = join(import.meta.dir, "../../TASK.md");
const TASK_MD = "./TASK.md";

console.log("① 存在的文件:", read_handler({ file: TASK_MD }).slice(0, 60));

describe("read_handler", () => {
  test("should read an existing file", () => {
    const result = read_handler({ file: TASK_MD });
    expect(result).toContain("# s02 · tool-use");
  });
  test("should read an not existing file", () => {
    expect(() => read_handler({ file: "./不存在.md" })).toThrowError(
      /file .* does not exist/,
    );
  });

  test("should throw an error for a non-existent file", () => {
    expect(() => read_handler({ file: "../不存在.md" })).toThrowError(
      /file .* is outside of the allowed directory/,
    );
  });

  test("should throw an error for invalid arguments", () => {
    expect(() => read_handler({})).toThrowError(/args error/);
    expect(() => read_handler({ file: 123 })).toThrowError(/args error/);
  });

  test("should throw for path escaping workspace (fence before existence)", () => {
    expect(() => read_handler({ file: "../../ROADMAP.md" })).toThrowError(
      /is outside of the allowed directory/,
    );
  });

  test("should throw an error for invalid path", () => {
    expect(() => read_handler({ file: "/etc/passwd" })).toThrowError(
      /file .* is outside of the allowed directory/,
    );
  });
});
```

### 4. read tool 优化

为了支持前面说的场景，我们优化一下实现：

```ts title="tools.ts"
const Root = resolve(import.meta.dir, "..");

export function read_handler(args: Record<string, unknown>) {
  const file = args?.file;
  const isArgsError = file === undefined || typeof file !== "string";

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
    return content;
  } catch (error) {
    // ④ 处理读取错误（权限、目录等）
    throw new Error(
      `Failed to read file ${file}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
```

相对路径一律 `resolve(Root, file)` 锚定到工作空间根，错误信息里把"你输入的路径"和"解析后的安全路径"都带上，模型下一轮自己就能修正。

### 5. 一个坑：先围栏，后存在

在过程中要注意：**优先处理越界问题，然后再处理不存在问题**，顺序不能反：

```ts
// 先
if (!safeFilePath.startsWith(Root))
// 再
if (!existsSync(safeFilePath))
```

为啥？因为 `resolve` 如果接受到一个绝对路径，会直接返回那个绝对路径，`Root` 被整个忽略——`resolve(Root, "/etc/passwd")` 的结果是 `/etc/passwd`，这正是越界的来源。

如果顺序反了，`existsSync("/etc/passwd")` 返回 true，后面的 `readFileSync` 就直接把工作区外的文件读出来了——围栏形同虚设。所以围栏（fence）必须在存在性检查之前。
