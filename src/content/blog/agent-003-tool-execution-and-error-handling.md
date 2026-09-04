---
title: Agent 003 - Tool Execution and Error Handling
subtitle: From Zero to Master · 用 spawnSync 重写 bash 工具，分清两类失败
description: 对比 execFileSync 与 spawnSync 的失败路径差异，用 spawnSync 重写 bash 工具：spawn 级错误与退出码级错误分开处理，退出码 0 时的 stderr 告警也要透传给 LLM。
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

这一节基于上一节：上一节我们接上了真实 LLM，并给 Agent 配了万能 bash 工具，当时的执行原语用的是 `execFileSync`。

这一节先做几组小实验，对比 `execFileSync` 与 `spawnSync` 在成功/失败路径上的差异，然后基于对比结论，用 `spawnSync` 重写 bash 工具，把"程序压根没跑起来"和"命令执行失败了"这两类失败分开对待。

## 实战

### 1. 对比 execFileSync 与 spawnSync

四个实验，建议自己跑一遍观察输出：

```ts title="compare.test.ts"
import { describe, test } from "bun:test";

import { execFileSync, spawnSync } from "node:child_process";

describe("test1 成功路径的返回形状", () => {
  test("execFileSync echo hi", async () => {
    const result = execFileSync("echo", ["hi"], { encoding: "utf-8" });
    console.log(result);
  });
  test("spawnSync echo hi", async () => {
    const result = spawnSync("echo", ["hi"], { encoding: "utf-8" });
    console.log(result);
  });
});

describe("test2 失败路径 exit 3", () => {
  test("execFileSync exit 3", async () => {
    try {
      const r = execFileSync("bash", ["-c", "exit 3"], { encoding: "utf-8" });
      console.log("甲没炸，返回:", JSON.stringify(r)); // ← 空1：这行会打出来吗？
    } catch (e: any) {
      console.log("甲炸了，message:", JSON.stringify(e.message)); // ← 空2：message 里有什么？
      console.log(
        "甲 Error 身上：status:",
        e.status,
        "| stderr:",
        JSON.stringify(e.stderr),
      );
    }
  });

  test("spawnSync exit 3", async () => {
    const r = spawnSync("bash", ["-c", "exit 3"], { encoding: "utf-8" });
    console.log(r);
    console.log(
      "乙:",
      r.status,
      JSON.stringify(r.stdout),
      JSON.stringify(r.stderr),
    ); // ← 空3：status 是几？
  });
});

describe("同一翻车现场的证据对照 echo hello; echo warn >&2; exit 3", () => {
  test("execFileSync", async () => {
    try {
      const r = execFileSync(
        "bash",
        ["-c", "echo hello; echo warn >&2; exit 3"],
        {
          encoding: "utf-8",
        },
      );
      console.log("甲没炸，返回:", JSON.stringify(r));
    } catch (e: any) {
      console.log("甲炸了，message:", JSON.stringify(e.message));
      console.log(
        "甲 Error 身上：status:",
        e.status,
        "| stderr:",
        JSON.stringify(e.stderr),
      );
    }
  });

  test("spawnSync", async () => {
    const r = spawnSync("bash", ["-c", "echo hello; echo warn >&2; exit 3"], {
      encoding: "utf-8",
    });
    console.log(r);
    console.log(
      "乙:",
      r.status,
      JSON.stringify(r.stdout),
      JSON.stringify(r.stderr),
    );
  });
});

describe("程序压根没跑起来 把可执行文件名换成 /nonexistent/bash", () => {
  test("execFileSync", async () => {
    try {
      const r = execFileSync("/nonexistent/bash", ["-c", "echo hello"], {
        encoding: "utf-8",
      });
      console.log("甲没炸，返回:", JSON.stringify(r));
    } catch (e: any) {
      console.log("甲炸了，message:", JSON.stringify(e.message));
      console.log(
        "甲 Error 身上：status:",
        e.status,
        "| stderr:",
        JSON.stringify(e.stderr),
      );
    }
  });

  test("spawnSync", async () => {
    const r = spawnSync("/nonexistent/bash", ["-c", "echo hello"], {
      encoding: "utf-8",
    });
    console.log("====================================");
    console.log(r);
    console.log(
      "乙:",
      r.status,
      JSON.stringify(r.stdout),
      JSON.stringify(r.stderr),
    );
  });
});
```

跑完观察，四组实验的现象分别是：

1. **成功路径**：`execFileSync` 直接返回 stdout 字符串；`spawnSync` 返回一个完整的 result 对象，`status: 0`、`stdout`、`stderr`、`error` 全部挂在对象上。
2. **exit 3**：`execFileSync` 抛异常，证据被打散在 `e.message` / `e.status` / `e.stderr` 各处，必须 try/catch 才拿得到；`spawnSync` 不抛，`r.status === 3`，stdout/stderr 就是普通字段，和成功路径同一个形状。
3. **同一翻车现场**：`echo hello; echo warn >&2; exit 3` —— `spawnSync` 的一个对象全带齐：`status: 3, stdout: "hello\n", stderr: "warn\n"`，证据一目了然。
4. **程序压根没跑起来**：`spawnSync` 也不抛，`r.error` 是 ENOENT 的 Error，`status` 是 `null`，stdout/stderr 都是 `null` —— 程序没跑完，哪来的退出码。

最后我们的结论是：

1. `spawnSync` 不会中断程序 —— 成功失败都不抛异常，所有情况可以统一基于一种返回格式处理
2. 信息更加的全 —— 不抛、不漏信息，成功失败一个形状，证据不会被 API 的形状撕碎

### 2. bash 工具采用 spawnSync 替换

基于上面的结论，把上一节的 `execFileSync` 换成 `spawnSync`：

```ts title="tools.ts"
export function bash_handler(args: Record<string, unknown>) {
  // ① 守卫区：原样搬过来（command 缺失/非字符串 → ToolArgsError）
  const command = args?.command;
  const isArgsError = command === undefined || typeof command !== "string";

  if (isArgsError) {
    throw new ToolArgsError(`args error ${JSON.stringify(args)}`);
  }

  // ② 跑：spawnSync，注意不需要 try/catch —— 它对退出码失败不抛
  const result = spawnSync("bash", ["-c", command], {
    encoding: "utf-8",
    timeout: 30000,
  });

  // ③ 岔口1：r.error 有值（spawn 级失败：ENOENT / 超时）
  //    提示：这级失败 r.stdout/r.stderr 是 null，别直接当字符串拼
  if (result.error) {
    throw new Error(
      `command ${command} spawn error: ${result.error.message}, stdout: ${JSON.stringify(
        result.stdout,
      )}, stderr: ${JSON.stringify(result.stderr)}`,
    );
  }

  // ④ 岔口2：r.status === 0 → return r.stdout
  if (result.status === 0) {
    // ④a stderr 有货（truthy）→ stdout 原文 + 换行 + 标记 + stderr 原文
    if (result.stderr) {
      return `${result.stdout}\n[stderr] ${result.stderr}`;
    }
    // ④b stderr 是空串（falsy）→ 原样返回，零污染
    return result.stdout;
  }

  // ⑤ 岔口3：退出码失败
  throw new Error(
    `command ${command} exit code ${result.status}, stdout: ${JSON.stringify(
      result.stdout,
    )}, stderr: ${JSON.stringify(result.stderr)}`,
  );
}
```

这里把两类失败分开对待，它们的本质完全不同：

|                | 岔口1 · spawn 级（r.error）                                                                                         | 岔口3 · 退出码级（status ≠ 0）                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 本质           | **bash 这个程序**没跑起来/没跑完                                                                                    | 程序跑起来了，**你的命令**执行完，非零退出                          |
| 真实场景       | ① 超时（`sleep 999` 撞上 30s 保险丝，被 SIGTERM 击杀，r.error = ETIMEDOUT）② bash 不存在/路径错（ENOENT）③ 权限不够 | `ls /nonexistent`、`exit 3`、`grep` 没匹配到（退出 1 是它的"答案"） |
| 证据形状       | stdout/stderr 是 **null**，status 不存在（都没跑完，哪来的退出码？）                                                | status 是具体数字，stdout/stderr 是字符串（可能空）                 |
| 模型该怎么解读 | **工具本身故障了**——环境问题，重试大概率还是炸                                                                      | 命令的有效观察——"失败"本身就是信息，模型自己推理下一步              |

另外，由于我们 agent 中调用工具的契约没有变——handler 正常返回就是成功，其他所有的错误都走 agent 里的 catch 转成 tool_result——所以 agent loop 这边不需要任何修改。

### 3. 细节：退出码 0 但有告警的场景

岔口2 里有个容易忽略的细节：

```ts
// ④ 岔口2：r.status === 0 → return r.stdout
if (result.status === 0) {
  // ④a stderr 有货（truthy）→ stdout 原文 + 换行 + 标记 + stderr 原文
  if (result.stderr) {
    return `${result.stdout}\n[stderr] ${result.stderr}`;
  }
  // ④b stderr 是空串（falsy）→ 原样返回，零污染
  return result.stdout;
}
```

这种属于"执行 OK 但有告警信息"的场景——命令本身成功了，但 stderr 里有内容（比如 npm install 的 deprecation warning）。这些告警也要尽量返回出去，LLM 才能知道，否则它会对潜在的问题毫无感知。
