---
title: Agent 001 - Agent Loop
subtitle: From Zero to Master · 手写第一个 Agent 循环
description: 从零手写最小可用的 Agent Loop：mock LLM、工具注册表、缺工具与调用报错的处理、observation 序列化的坑，理解 Agent 的核心运行机制。
tags:
  - agent学习专栏
pubDate: 2026-08-30
---

## 学习材料与技术栈

学习的材料主要来源于

> 1. [learn.shareai.run](https://learn.shareai.run/zh/)
> 2. 构建的学习Agent + GLM 3
> 3. Claude code 官方的文档于一些教程

主要采用TS进行体验

## 学习

学习Agent，了解Agent循环的概念，手动写一个基本的Agent循环

基本概念可以这样理解，Agent就是LLM推理，然后给LLM配上了外围的手脚，他可以调用外围工具，然后反馈，继续推理，最终当不需要调用时结束返回结论，这整个循环就是Agent Loop

![Agent Loop](/assets/images/agent/agent-loop.svg)

上面这个图很好的描述了，其中由于LLM是无状态的，所以我们往往需要将每一次的信息都存储下来，放到一个messages中

## 实战

### 1. 最基本的实现

首先确定几个目标

1. 我们需要有一个Agent loop的循环
2. 循环要进行工具的处理
3. 我们要有一个mock的LLM接口对外提供

我们先写到一起,mock llm 模拟真实的接口，后续可完全替换

```ts
/**
 * 这里我们模拟一个llm接口，假设是基于最后一个消息返回
 */
function mock_llm(messages: Message[]): LlmResponse {
  const lastMessage = messages[messages.length - 1];

  if (lastMessage.type === "tool_result") {
    return {
      type: "final",
      content: "结束工具的调用",
    };
  } else if (lastMessage.role === "user") {
    return {
      type: "tool_use",
      name: "add",
      args: {
        a: 10,
        b: 20,
      },
    };
  }
}

// agent loop
function agent(task: string, { maxTurns = 10 }: Config = {}) {
  const message: Message[] = [];
  // 我们需要把我们的任务信息塞入message
  message.push({
    role: "user",
    content: task,
  });

  let turns = 0;
  while (true) {
    if (turns >= maxTurns) {
      throw new Error(
        `too many llm call exceed max turns, (maxTurns ${maxTurns}, current turns ${turns})`,
      );
    }

    const llm_response = mock_llm(message);

    turns++;

    if (llm_response.type === "tool_use") {
      const { a, b } = llm_response.args;
      const res = add(a, b);

      message.push({
        role: "user",
        type: "tool_result",
        content: JSON.stringify(toolResult),
      });
    }

    if (llm_response.type === "final") {
      return {
        role: "assistant",
        content: llm_response.content,
      };
    }
  }
}

// tool

function add(a: number, b: number) {
  return a + b;
}
```

### 2 工具与类型

其实上面写的时候你会发现有问题

我们定义mock的response类型是

```ts
type LlmResponse =
  | { type: "tool_use"; name: string; args: Record<string, unknown> }
  | { type: "final"; content: string };
```

- 问题1: 这里我们定义args，肯定是value是unknown类型，这个是合理的，不同的工具有些可能是number、有些可能是string，那么这里工具这里的类型要怎么调整
- 问题2: 我们肯定不止有一个工具对吧，当前硬编码写死了也是不行的

改造一下

工具这里就改造为tool，tool_handler map，对外暴露，这种，args，也就是所有的直接传递args即可

> 可以思考下，这样是不是agent loop哪里就统一了，而在 工具这里稍微复杂一些

```ts
const tools_map: Record<string, ToolHandler> = {
  add: add_handler,
};

function add_handler(args: Record<string, unknown>) {
  const isArgsError =
    Number.isNaN(Number(args?.a)) || Number.isNaN(Number(args?.b));

  if (isArgsError) {
    throw new ToolArgsError(`args error ${JSON.stringify(args)}`);
  }

  return Number(args.a) + Number(args.b);
}
```

这里我们把handler写好了，同时把错误的参数场景我们进行了一个Error的类型定义，并抛出去，这个是有必要的，在agent 中，静默失败是更加可怕的，要让LLM得到足够的信息才行

做外这个那么agent对于的也可以改造一下啦

```ts
if (llm_response.type === "tool_use") {
  const toolName = llm_response.name;

  const res = tools_map[toolName](llm_response.args);

  message.push({
    role: "user",
    type: "tool_result",
    content: JSON.stringify(res),
  });
}
```

### 3 miss tool的场景和tool调用报错的场景

上述看上去是ok，但其实是正常的逻辑，

- 问题1 ：假设没有工具呢？比如llm返回的调用工具是div、mul能，这种怎么搞，
- 问题2 ：前面的args错误呢？还有其他工具如果调用错误呢？

所有要改造一下

```ts
if (llm_response.type === "tool_use") {
  const toolName = llm_response.name;
  const hasTool = Object.keys(tools_map).includes(toolName);

  let toolResult: unknown = "";
  if (hasTool) {
    try {
      toolResult = tools_map[toolName](llm_response.args);
    } catch (err) {
      toolResult = err instanceof Error ? err.message : String(err);
    }
  } else {
    toolResult = `not has this tool ${toolName}, we have some tools ${JSON.stringify(Object.keys(tools_map))}`;
  }
  message.push({
    role: "user",
    type: "tool_result",
    content: JSON.stringify(toolResult),
  });
}
```

如果有工具就调用，同时catch可能错误
如果没有工具，就直接给LLM，我们存在工具的信息即可

### 4. JSON.stringify的坑

我们前面使用了JSON的stringify最终将toolResult添加的方式，但是这个方式有缺陷

但是实际上可能有很多的tool_handler作为函数，他实际正常结果无返回值，这种情况下会有问题
toolResult 就是 undefined，这种序列号会有问题

```js
let a = { a: 1, b: undefined, c: null };
JSON.stringify(a)
>'{"a":1,"c":null}'
```

可以看到b的这个key没有了，所以这里我们需要改造一下，不能简单用stringily

```ts
export function toObservation(result: unknown): string {
  return JSON.stringify(result ?? null);
}

message.push({
  role: "user",
  type: "tool_result",
  content: toObservation(toolResult),
});
```

由于null是可以保留的，所以我们用?? 把所有的undefined 换成 null即可

### 5. 拆分模块

当前所有的都在一个文件下，不好，拆分为
agent、mock_llm、tools、types

`agent.ts` —— Agent 循环主体：

```ts title="agent.ts"
import { mock_llm } from "./mock_llm";
import { ToolArgsError } from "./ToolArgsError";
import { tools_map } from "./tools";
import { Config, Message } from "./types";

export function agent(task: string, { maxTurns = 10 }: Config = {}) {
  const message: Message[] = [];
  message.push({
    role: "user",
    content: task,
  });

  let turns = 0;
  while (true) {
    if (turns >= maxTurns) {
      throw new Error(
        `too many llm call exceed max turns, (maxTurns ${maxTurns}, current turns ${turns})`,
      );
    }

    const llm_response = mock_llm(message);

    turns++;

    if (llm_response.type === "tool_use") {
      const toolName = llm_response.name;
      const hasTool = Object.keys(tools_map).includes(toolName);

      let toolResult: unknown = "";
      if (hasTool) {
        try {
          toolResult = tools_map[toolName](llm_response.args);
        } catch (err) {
          toolResult = err instanceof Error ? err.message : String(err);
        }
      } else {
        toolResult = `not has this tool ${toolName}, we have some tools ${JSON.stringify(Object.keys(tools_map))}`;
      }
      message.push({
        role: "user",
        type: "tool_result",
        content: toObservation(toolResult),
      });
    }

    if (llm_response.type === "final") {
      return {
        role: "assistant",
        content: llm_response.content,
      };
    }
  }
}

export function toObservation(result: unknown): string {
  return JSON.stringify(result ?? null);
}
```

`mock_llm.ts` —— 模拟的 LLM 接口：

```ts title="mock_llm.ts"
import { Message } from "./types";

type LlmResponse =
  | { type: "tool_use"; name: string; args: Record<string, unknown> }
  | { type: "final"; content: string };

export function mock_llm(messages: Message[]): LlmResponse {
  if (messages.length === 0) {
    throw new Error("mock_llm: messages array cannot be empty");
  }

  const lastMessage = messages[messages.length - 1];

  if (lastMessage.type === "tool_result") {
    return {
      type: "final",
      content: "结束工具的调用",
    };
  } else if (lastMessage.role === "user") {
    let isDiv = lastMessage.content.includes("div");
    return {
      type: "tool_use",
      name: isDiv ? "div" : "add",
      args: {
        a: 10,
        b: 20,
      },
    };
  }

  // 其他任何未预期的消息类型/角色 → 大声失败
  throw new Error(
    `mock_llm: unsupported last message - type="${lastMessage.type}", role="${lastMessage.role}"`,
  );
}
```

`tools.ts` —— 工具注册表与 handler：

```ts title="tools.ts"
import { ToolArgsError } from "./ToolArgsError";
import { ToolHandler } from "./types";

export const tools_map: Record<string, ToolHandler> = {
  add: add_handler,
};

export function add_handler(args: Record<string, unknown>) {
  const isArgsError =
    Number.isNaN(Number(args?.a)) || Number.isNaN(Number(args?.b));

  if (isArgsError) {
    throw new ToolArgsError(`args error ${JSON.stringify(args)}`);
  }

  return Number(args.a) + Number(args.b);
}
```

`types.ts` —— 类型定义：

```ts title="types.ts"
export interface Message {
  role: "user" | "assistant";
  type?: "tool_result";
  content: string;
}

export interface Config {
  maxTurns?: number;
}

export type ToolHandler = (args: Record<string, unknown>) => unknown;
```

## 验证

这边可以让AI写一些UT进行相关的验证即可
然后自己和ai对话梳理一下逻辑这块
