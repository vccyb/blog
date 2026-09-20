---
title: Agent 009 - Hooks
subtitle: From Zero to Master · 把 loop 的关键时刻变成广播点
description: 用观察者模式给 agent loop 挂扩展点：四个 HookEvent、triggerHooks 收集 PreToolUse 裁决、权限改造成订阅者、模块级状态的 UT 污染与 resetHooks，PostToolUse 只验好下场。
tags:
  - agent学习专栏
pubDate: 2026-09-20
---

## 学习材料与技术栈

学习的材料主要来源于

> 1. [learn.shareai.run](https://learn.shareai.run/zh/)
> 2. 构建的学习Agent + GLM 3
> 3. Claude code 官方的文档于一些教程

主要采用TS进行体验

## 学习

上一节我们把权限检查硬编码进了 agent loop。现在假设还要加"命令审计"、"调用日志"、"结果自动格式化"……难道每个都去改 loop 源码吗？loop 会被改成一锅大杂烩。

这一节实现 hook 机制，把问题倒过来：**loop 只负责在关键时刻广播事件，关心这件事的人自己来订阅。**四个事件正好对应 loop 的四个时刻：

- `UserPromptSubmit` —— 用户任务进来时
- `PreToolUse` —— 每次工具执行前（权限就是在这拦截的）
- `PostToolUse` —— 工具正常返回后
- `Stop` —— loop 收工时

这就是控制反转：loop 不再认识"权限"这种具体业务，它只认识事件。

## 实战

### 1. 定义 hook 的几个类型

```ts title="types.ts"
export type HookEvent =
  | "UserPromptSubmit"
  | "PreToolUse"
  | "PostToolUse"
  | "Stop";
```

### 2. 基础实现

```ts title="hooks.ts"
import { HookEvent } from "./types";
type HookCallback = (...args: any[]) => any;
const HOOKS: Record<HookEvent, HookCallback[]> = {
  UserPromptSubmit: [],
  PreToolUse: [],
  PostToolUse: [],
  Stop: [],
};

function registerHook(event: HookEvent, callback: HookCallback) {
  HOOKS[event].push(callback);
}

function triggerHooks(event: HookEvent, ...args: any[]) {
  return HOOKS[event].map((callback) => callback(...args));
}

export { registerHook, triggerHooks };
```

两个设计点：

1. **triggerHooks 用 `map` 而不是 `forEach`**——把每个 hook 的返回值收集成数组带回来。这是给 `PreToolUse` 埋的伏笔：订阅者要能回传裁决。
2. **零订阅返回空数组，不炸**——没人听广播，广播照常发。

### 3. 探针：先喊一嗓子

先写个探针简单检查一下：

```ts title="probe.ts"
import { registerHook, triggerHooks } from "../hooks";

registerHook("PreToolUse", (block) => {
  console.log(
    `[HOOK] PreToolUse -> ${block.name} ${JSON.stringify(block.input)}`,
  );
  return `done ${block.name}`;
});

const res1 = triggerHooks("PreToolUse", {
  type: "tool_use",
  id: "t_1",
  name: "bash",
  input: { command: "ls -la" },
});
const res2 = triggerHooks("PreToolUse", {
  type: "tool_use",
  id: "t_2",
  name: "read",
  input: { file: "TASK.md" },
});

console.log(res1); // ["done bash"]
console.log(res2); // ["done read"]
```

日志可见、返回值收得到，机制是活的。

### 4. 补齐基本 UT

```ts title="hooks.test.ts"
import { describe, test, expect, mock } from "bun:test";
import { registerHook, triggerHooks } from "../hooks";

describe("test hooks", () => {
  // ① 两个 PreToolUse hook 按注册顺序说话
  test("preToolUse hook 按注册顺序说话", () => {
    const calls: string[] = [];

    const fn1 = mock(() => {
      calls.push("1");
    });
    const fn2 = mock(() => {
      calls.push("2");
    });
    registerHook("PreToolUse", fn1);
    registerHook("PreToolUse", fn2);
    triggerHooks("PreToolUse");

    expect(calls.length).toBe(2);
    expect(calls).toBeArray();
    expect(calls[0]).toBe("1");
    expect(calls[1]).toBe("2");
  });

  // ② 触发 Stop（零订阅）→ 无声不炸
  test("触发 Stop（零订阅）→ 无声不炸", () => {
    expect(() => triggerHooks("Stop")).not.toThrow();
  });

  // ③ PostToolUse hook 收到 (block, output) 并打印
  test("PostToolUse hook 收到 (block, output) 并打印", () => {
    const received: any[] = []; // 存证本
    registerHook("PostToolUse", (block, output) => {
      received.push([block, output]);
    });

    const block = { type: "tool_result", tool_use_id: "t_1", content: "42" };
    triggerHooks("PostToolUse", block, "42");

    expect(received.length).toBe(1); // hook 恰好被叫了一次
    expect(received[0][0]).toBe(block); // 第1个参数：还是同一个对象（引用没换）
    expect(received[0][1]).toBe("42"); // 第2个参数：原样
  });

  // ④ Pre hook 的返回值能被 triggerHooks 收集
  test("④ Pre hook 的返回值能被 triggerHooks 收集", () => {
    const denyHook = () => {
      return "deny";
    };
    registerHook("PreToolUse", denyHook);

    expect(triggerHooks("PreToolUse")[0]).toBe("deny");
  });

  // ⑤ 零订阅 → 返回空数组（不是 undefined）
  test("⑤ 零订阅 → 返回空数组（不是 undefined）", () => {
    expect(triggerHooks("PreToolUse")).toEqual([]);
  });
});
```

### 5. 一个问题：UT 跑不过

跑起来会发现 ④⑤ 红了。原因：`HOOKS` 是**模块级状态**，整个测试进程里它一直活着——前面用例注册的 hook 全部残留，⑤ 里"零订阅"根本不成立，④ 的返回数组前面也垫着别人的 `undefined`。

模块级单例 + 共享测试进程，就必须保证用例独立性，给每个用例前清场：

```ts title="hooks.test.ts"
beforeEach(() => resetHooks());

function resetHooks() {
  for (const event of Object.keys(HOOKS) as HookEvent[]) {
    HOOKS[event] = [];
  }
}
```

这算 hook 机制的第一笔学费：**能力越全局，越要自己管好生命周期。**

### 6. 把 permission 改造成 hook

机制有了，把上一节硬编码在 loop 里的权限检查改造成订阅者。先包一层：

```ts title="permission.ts"
import { checkPermission } from "../permission";
import { ToolUseBlock, Verdict } from "../types";

export const permissionHook = (block: ToolUseBlock): Verdict => {
  return checkPermission(block.name, block.input);
};
```

然后 loop 里的调用点从"直接调 checkPermission"改成"广播事件、聚合裁决"：

```ts title="agent.ts"
// const verdict = checkPermission(toolName, use.input);  ← 旧
const verdicts = triggerHooks("PreToolUse", use);
const deny = verdicts.find((v) => v?.decision === "deny");
const ask = verdicts.find((v) => v?.decision === "ask");
const verdict = deny ?? ask ?? { decision: "allow" };
```

聚合规则把 008 的边界原则原样保留：**deny 优先于 ask，都没有才放行**。而 `permissionHook` 挂不挂、还有谁挂，loop 一概不知——门由组装者挂，不由循环挂：

```ts title="agent.test.ts"
beforeEach(() => {
  resetHooks(); // 你刚踩过的污染坑，别再踩
  registerHook("PreToolUse", permissionHook); // 门挂上——但由组装者挂，不由循环挂
});
```

从此加"命令审计"就是再注册一个 `PreToolUse` 订阅者的事，loop 源码一行不动。

### 7. PostToolUse：只验好下场

Pre 管事前，Post 管事后。触发点挂在工具正常返回、回执已备好之后：

```ts title="agent.ts"
const receipt: ToolResultBlock = {
  type: "tool_result",
  tool_use_id: use.id,
  content: toObservation(toolResult),
  is_error,
};
if (!is_error) {
  triggerHooks("PostToolUse", receipt, toolResult);
}
return receipt;
```

注意触发条件：**只有 `!is_error` 才广播**。deny 落锤的没跑 handler，没有"事后"可言；工具自己抛错的错误下场也不请验尸官——Post 订阅者（日志、自动格式化之类）只关心真实产出。参数是二件套：`(回执, 原始输出)`，一个给协议看，一个给干活的人看。

### 8. PostToolUse 的 UT

```ts title="agent.test.ts"
test("行为18：PostToolUse 收到 (回执, 原始输出)", async () => {
  const seen: Array<[ToolResultBlock, unknown]> = [];
  registerHook("PostToolUse", (block, output) => seen.push([block, output]));

  // 夹具自造自清洁：不赌阶段目录里住着哪张卡
  const FIXTURE = "probe-fixture-agent18.md";
  const FIXTURE_TEXT = "# s04 行为18 夹具：PostToolUse 收尸现场";
  writeFileSync(resolve(Root, FIXTURE), FIXTURE_TEXT);

  // mock llm → read 工具（allow 快车道）
  let count = 1;
  const fakeLlmFn = mock(
    async (messages: Message[], tools: Tool[]): Promise<LlmResponse> => {
      if (count === 1) {
        count++;
        return {
          content: [
            {
              type: "tool_use",
              id: "t18",
              name: "read",
              input: { file: FIXTURE },
            },
          ],
          stop_reason: "tool_use",
        };
      }
      return {
        content: [{ type: "text", text: "ok" }],
        stop_reason: "end_turn",
      };
    },
  );

  await agent("test task", { maxTurns: 10, llmFn: fakeLlmFn });

  expect(seen.length).toBe(1); // 恰好收了一次尸
  const [block, output] = seen[0];
  expect(block.tool_use_id).toBe("t18"); // 配对没错人
  expect(block.is_error).toBe(false); // 好下场
  expect(JSON.stringify(output)).toContain(FIXTURE_TEXT); // 原始输出：真读了文件
  expect(block.content).toBe(toObservation(output)); // 照片与尸体一致
  rmSync(resolve(Root, FIXTURE));
});

test("行为19：deny 下场 → PostToolUse 沉默", async () => {
  const seen: unknown[] = [];
  registerHook("PostToolUse", (block) => seen.push(block));

  // rm -rf / 撞 DENY 表第一条：门先落锤，handler 根本不跑（008 行为7 同款）
  let count = 1;
  const fakeLlmFn = mock(async (messages: Message[]): Promise<LlmResponse> => {
    if (count === 1) {
      count++;
      return {
        content: [
          {
            type: "tool_use",
            id: "t19",
            name: "bash",
            input: { command: "rm -rf /" },
          },
        ],
        stop_reason: "tool_use",
      };
    }
    return {
      content: [{ type: "text", text: "ok" }],
      stop_reason: "end_turn",
    };
  });

  await agent("test task", { llmFn: fakeLlmFn });

  expect(seen.length).toBe(0); // 没跑就没有尸体，验尸官不到场
});
```

两条互为镜像：好下场的（真执行、回执与原始输出一致）恰好广播一次；deny 下场的零次——**没跑就没有尸体**。

## 小结

1. **hook 是控制反转**：loop 只广播事件，不关心谁在听；权限从"loop 里的硬编码"降级为"PreToolUse 的一个订阅者"；
2. **返回值就是接口**：`triggerHooks` 用 map 收集裁决，聚合时 deny > ask > allow，008 的边界原则原样平移；
3. **门由组装者挂，不由循环挂**：注册谁、何时注册，是入口/测试的组装责任；
4. **模块级状态要 reset**：全局单例 + 共享测试进程，`beforeEach(resetHooks)` 保用例独立；
5. **Post 只验好下场**：`!is_error` 才广播，拒绝和异常不进验尸房。
