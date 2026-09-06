---
title: Agent 007 - Parallel Tool Use
subtitle: From Zero to Master · N 个 tool_use 对 N 个 tool_result，一一配对
description: 模型一轮返回多个 tool_use 怎么办：先用假 LLM 写一个会红的 UT，把 find 换成 filter，一轮内逐个执行并按 tool_use_id 一一配对回填 tool_result。
tags:
  - agent学习专栏
pubDate: 2026-09-07
---

## 学习材料与技术栈

学习的材料主要来源于

> 1. [learn.shareai.run](https://learn.shareai.run/zh/)
> 2. 构建的学习Agent + GLM 3
> 3. Claude code 官方的文档于一些教程

主要采用TS进行体验

## 学习

工具卡片越加越多，一个新的问题浮出来：**模型一轮返回多个工具调用怎么办？**比如它想同时读两个文件——"先读 TASK.md，再读 BUILD.md"没必要拆成两轮对话，一轮里发两个 `tool_use` 块才是自然的方式。

我们当前的 agent loop 只认第一个 `tool_use`，多出来的会被静默丢掉。这一期用先红后绿的方式修掉它：先写一个会红的 UT 把问题钉死，再改实现。

UT 里通过 `llmFn` 注入假 LLM（依赖注入），不真调接口，测试完全确定。

## 实战

### 1. 先写一个会红的 UT

场景：第一轮假 LLM 一次返回两个 `tool_use`，第二轮收工。我们断言：N 个调用要有 N 个结果，且 `tool_use_id` 一一配对。

```ts title="agent.test.ts"
test("多 tool_use → N 个调用 N 个结果，一一配对 tool_use_id", async () => {
  const calls: Message[][] = [];
  const fakeLlmFn = async (
    messages: Message[],
    tools: Tool[],
  ): Promise<LlmResponse> => {
    calls.push(JSON.parse(JSON.stringify(messages)));
    if (calls.length === 1) {
      return {
        // 第一轮：一次发两个 tool_use
        content: [
          { type: "text", text: "我同时干两件事" },
          {
            type: "tool_use",
            id: "call_1",
            name: "read_tool",
            input: { file: "TASK.md" },
          },
          {
            type: "tool_use",
            id: "call_2",
            name: "read_tool",
            input: { file: "BUILD.md" },
          },
        ],
        stop_reason: "tool_use",
      } as unknown as LlmResponse;
    }
    return {
      // 第二轮：收工
      content: [{ type: "text", text: "都办完了" }],
      stop_reason: "end_turn",
    } as unknown as LlmResponse;
  };
  await agent("干两件事", { llmFn: fakeLlmFn, maxTurns: 5 });
  const lastMsg = calls[1][calls[1].length - 1];
  const results = (lastMsg.content as any[]).filter(
    (b) => b.type === "tool_result",
  );

  expect(results.length).toBe(2); // ← 红灯就在这：现在是 1
  expect(results.map((r) => r.tool_use_id).sort()).toEqual([
    "call_1",
    "call_2",
  ]); // id 一一配对
});
```

跑一下，红灯如约而至：

```text
273 | expect(results.length).toBe(2); // ← 红灯就在这：现在是 1
^
error: expect(received).toBe(expected)

Expected: 2
Received: 1
```

### 2. 红灯原因：find 只取了第一个

看当前实现，问题一目了然：

```ts title="agent.ts（旧）"
const use = llm_response.content.find((b) => b.type === "tool_use");

const toolName = use.name;
const hasTool = Object.keys(registry).includes(toolName);

let toolResult: unknown = "";
if (hasTool) {
  try {
    toolResult = registry[toolName].handler(use.input);
  } catch (err) {
    toolResult = err instanceof Error ? err.message : String(err);
  }
} else {
  toolResult = `not has this tool ${toolName}, we have some tools ${JSON.stringify(Object.keys(registry))}`;
}
```

这里只做了一次 `find` 的逻辑，默认就是一个工具的处理——第二个 `tool_use` 被静默丢弃，协议上等于"模型发了两个请求，我们只回了一个"。002 里定下的规矩是"大声失败，不静默"，这里就是个漏网之鱼（还好被 UT 揪出来了）。

### 3. 多工具的处理优化：find → filter

把"找一个"换成"找全部"，逐个执行，最后在**同一条 user 消息**里把 N 个 `tool_result` 一起回填：

```ts title="agent.ts"
if (llm_response.stop_reason === "tool_use") {
  const useTools = llm_response.content.filter((b) => b.type === "tool_use");

  if (!useTools || useTools.length === 0) {
    // 协议违约：网关说有工具调用，块却找不到——这不是模型的错
    throw new Error(
      `protocol violation: stop_reason=tool_use but no tool_use block; blocks=${JSON.stringify(llm_response.content)}`,
    );
  }

  const result = useTools.map((use) => {
    const toolName = use.name;

    const hasTool = Object.keys(registry).includes(toolName);

    let toolResult: unknown = "";
    if (hasTool) {
      try {
        toolResult = registry[toolName].handler(use.input);
      } catch (err) {
        toolResult = err instanceof Error ? err.message : String(err);
      }
    } else {
      toolResult = `not has this tool ${toolName}, we have some tools ${JSON.stringify(Object.keys(registry))}`;
    }

    return {
      tool_use_id: use.id,
      tool_name: toolName,
      result: toolResult,
    };
  });

  messages.push({
    role: "user",
    content: result.map((r) => ({
      type: "tool_result",
      tool_use_id: r.tool_use_id,
      content: toObservation(r.result),
    })),
  });
}
```

绿灯，UT 过了。核心就一句话：**每一个 `tool_use` 都要被处理、被应答。**

## 小结

几个值得记住的点：

1. **一一配对是协议**：N 个 `tool_use` 必须在下一条 user 消息里回 N 个 `tool_result`，靠 `tool_use_id` 配对——可以理解为 HTTP 请求/响应的关系，发了不回，接口就悬着。
2. **N 个结果装进一条消息**：不是每答一条就 push 一条 user 消息，而是一个 `tool_result` 块数组一次性回填，顺序与 `tool_use` 对应。
3. **"并行"在协议侧，不在执行侧**：这版仍然是 `map` 串行逐个执行 handler；真要并发执行可以上 `Promise.all`，但先把协议跑对更重要——省轮次（一次 LLM 调用干多件事）的价值已经拿到了。
