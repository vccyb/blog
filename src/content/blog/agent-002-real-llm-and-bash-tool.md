---
title: Agent 002 - Real LLM and Bash Tool
subtitle: From Zero to Master · 接入真实 LLM 与万能 bash 工具
description: 把 mock LLM 换成真实接口：处理 thinking 块的坑、基于类型重构消息协议、给 LLM 定义万能 bash 工具，以及 registry 注册表与“大声失败”的优化。
tags:
  - agent学习专栏
pubDate: 2026-08-31
---

## 学习材料与技术栈

学习的材料主要来源于

> 1. [learn.shareai.run](https://learn.shareai.run/zh/)
> 2. 构建的学习Agent + GLM 3
> 3. Claude code 官方的文档于一些教程

主要采用TS进行体验

## 学习

这一节基于上一节，我们将llm切换为真实的接口，然后并且定义一个万能的bash工具

## 实战

### 1. 真实的LLM接口

`llm.ts` —— 用 fetch 直接调真实接口，后续所有 LLM 调用都走这里：

```ts title="llm.ts"
import { llmConfig } from "./config";

export async function callLlm(messages: string[]) {
  const response = await fetch(llmConfig.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llmConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: llmConfig.model,
      max_tokens: 1024,
      messages: messages.map((message) => ({ role: "user", content: message })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to call LLM: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
```

跑一下，看看真实的返回长什么样：

```ts
// 测试， 可以实际看一下输出
const result = await callLlm(["Hello, how are you?"]);
console.log("LLM Response:", result);

//输出大概是这样的json
LLM Response:
{
  id: "msg_2026083021512779a20e8ee17344af",
  type: "message",
  role: "assistant",
  model: "glm-5.3-flash",
  content: [
    {
      type: "thinking",
      thinking: "...",
      signature: "96d2107949584cc3ad1e8bdb",
    },
    {
      type: "text",
      text: "Hello! I'm doing well, thanks for asking. How about you? Is there anything I can help you with today?",
    }
  ],
  stop_reason: "end_turn",
  stop_sequence: null,
  usage: {
    input_tokens: 18,
    output_tokens: 498,
    cache_read_input_tokens: 0,
    server_tool_use: {
      web_search_requests: 0,
    },
    service_tier: "standard",
  },
}
```

这边可以看到比我们想象的要复杂，他还多了thinking块，这里有一个坑点，就是如果max_token太小，就会卡在thinking这里

或者你关闭掉思考也可

```json
{
  "thinking": {
    "type": "disabled"
  }
}
```

不过我使用的是GLM-3-FLASH 无法关闭

> GLM-5.3 GLM-5.3-FLASH GLM-5.2 GLM-5.1 GLM-5 GLM-4.7 系列默认开启 Thinking，这一点不同于 GLM-4.6 的默认"混合 thinking（自动开启）"。
> 如果您想关闭 thinking，请使用以下，注意 GLM-5.3 GLM-5.3-FLASH 强制思考不能关闭。

### 2. 类型定义

看到了真实的接口返回后，这边补一些类型

```ts title="types.ts"
// types.ts —— 两种形状，各自有名有姓，不许揉
type TextBlock = { type: "text"; text: string };
type ToolUseBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};
type ToolResultBlock = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};
type Block = TextBlock | ToolUseBlock | ToolResultBlock;

export interface Message {
  role: "user" | "assistant";
  content: string | Block[];
}

export interface LlmResponse {
  content: Block[];
  stop_reason: string;
}

export interface Config {
  maxTurns?: number;
}

export type ToolHandler = (args: Record<string, unknown>) => unknown;
```

### 3. 基于类型重新构造

首先是call llm

```ts title="llm.ts"
import { LlmResponse, Message } from "./types";

export async function callLlm(messages: Message[]): Promise<LlmResponse> {
  ...
}
```

然后是agent，改的东西会比较多一些，之前的都要基于message的格式改

```ts title="agent.ts"
export async function agent(task: string, { maxTurns = 10 }: Config = {}) {
  const messages: Message[] = [];

  messages.push({
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

    const llm_response = await callLlm(messages);

    turns++;

    // llm回答先添加
    messages.push({
      role: "assistant",
      content: llm_response.content,
    });

    if (llm_response.stop_reason === "tool_use") {
      const use = llm_response.content.find((b) => b.type === "tool_use");
      const toolName = use?.name ?? "";
      const hasTool = Object.keys(tools_map).includes(toolName);

      let toolResult: unknown = "";
      if (hasTool) {
        try {
          toolResult = tools_map[toolName](use?.input ?? {});
        } catch (err) {
          toolResult = err instanceof Error ? err.message : String(err);
        }
      } else {
        toolResult = `not has this tool ${toolName}, we have some tools ${JSON.stringify(Object.keys(tools_map))}`;
      }
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: use?.id ?? "",
            content: toObservation(toolResult),
          },
        ],
      });
    } else {
      return {
        role: "assistant",
        content: llm_response.content
          .filter((b) => b.type === "text")
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("\n"),
      };
    }
  }
}
```

### 4. 添加bash 工具

```ts title="tools.ts"
export function bash_handler(args: Record<string, unknown>) {
  const command = args?.command;
  const isArgsError = command === undefined || typeof command !== "string";

  if (isArgsError) {
    throw new ToolArgsError(`args error ${JSON.stringify(args)}`);
  }

  try {
    return execFileSync("bash", ["-c", command], {
      encoding: "utf-8",
      timeout: 30000,
    });
  } catch (error: any) {
    throw new Error(
      `Bash command failed: ${error.message}\n${error.stderr?.toString() || ""}`,
    );
  }
}
```

这里注意一下，失败抛出，避免静默失败

### 5. 工具定义

参考接口，定义，给tools

这一步要把工具提供给我们真实的llm

先补一下ts

```ts title="types.ts"
export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}
export type Tools = Tool[];
```

```ts title="tools.ts"
export const bash_tool: Tool = {
  name: "bash",
  description: "Execute a bash command",
  input_schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The bash command to execute",
      },
    },
    required: ["command"],
  },
};
```

### 6. agent传递tools

```ts title="llm.ts"
export async function callLlm(
  messages: Message[],
  tools?: Tool[],
): Promise<LlmResponse> {
  const response = await fetch(llmConfig.url, {
    ...
    body: JSON.stringify({
      ...
      tools
    }),
  });
```

这里要隔离开，让call llm没有感知，用参数即可

```ts
const llm_response = await callLlm(messages, [bash_tool]);
```

### 7. 测试

```ts title="index.ts"
import { agent } from "./agent";

const result = await agent("echo hello world");

console.log("Agent result:", result);

const result2 = await agent("ls -l");
console.log("Agent result 2:", result2);
```

## 优化

1. 尽量不要静默失败，之前使用了一些 ?? 这里应该最好直接报错，如果llm推理有工具，但是有没找到

```ts
const use = llm_response.content.find((b) => b.type === "tool_use");

if (!use) {
  // 协议违约：网关说有工具调用，块却找不到——这不是模型的错
  throw new Error(
    `protocol violation: stop_reason=tool_use but no tool_use block; blocks=${JSON.stringify(llm_response.content)}`,
  );
}

// 后续的user，就可以完全按照tool_use的block来
tool_use_id: use.id,
```

2. llm 里面的错误也是，显示全一点

```ts
throw new Error(
  `Failed to call LLM: ${response.status} ${response.statusText}`,
);
```

3. tools 优化下

之前没有合在一起

```ts
export const registry: Record<string, ToolUnit> = {
  bash: {
    definition: bash_tool,
    handler: bash_handler,
  },
};
```

使用的地方记得改，之前是tools_map 统一切用registry

提供工具的地方可以改成计算

```ts
const llm_response = await callLlm(
  messages,
  Object.values(registry).map((unit) => unit.definition),
);
```
