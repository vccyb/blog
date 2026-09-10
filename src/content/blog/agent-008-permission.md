---
title: Agent 008 - Permission
subtitle: From Zero to Master · deny / ask / allow 三道闸门，边界不谈判
description: 给工具调用加权限管理：DENY/ASK 规则表、先提取审计对象再匹配、陌生工具一律 fail-closed、is_error 回执、onAsk 问人回调，以及 deny 优先于 ask 的王牌测试。
tags:
  - agent学习专栏
pubDate: 2026-09-10
---

## 学习材料与技术栈

学习的材料主要来源于

> 1. [learn.shareai.run](https://learn.shareai.run/zh/)
> 2. 构建的学习Agent + GLM 3
> 3. Claude code 官方的文档于一些教程

主要采用TS进行体验

## 学习

工具越加越多：read / write / edit / grep，外加万能的 bash。能力越大，越需要权限管理——不能模型想干嘛就干嘛。

核心逻辑就是下面这张图：

![权限管线：所有工具调用前先 check，三道闸门](https://learn.shareai.run/course-assets/s03_permission/permission-pipeline.svg)

1. 在所有工具调用前需要 check
2. 三道闸门：是否硬编码不允许（deny）、敏感操作询问用户（ask）、其他的放行（allow）
3. 结果（包括拒绝的理由）塞回 tool_result——拒绝也要给模型一个理由，它才能改道

## 实战

### 1. 类型与规则

```ts title="permission.ts"
export type Decision = "allow" | "deny" | "ask";

type Rule = {
  tool: string; // 哪个工具："bash" / "write" / …，或 "*" 表全部
  pattern: RegExp; // 什么模式（对 bash 就是命令串）
  reason: string; // 为什么——以后要进回执给模型看
};
```

先给两道闸门填一批规则（和 GLM 讨论后的第一版）：

```ts title="permission.ts"
export const DENY_RULES: Rule[] = [
  {
    // 递归强删：r 和 f 同时在场，四种写法（合并/换序/拆开）一网打尽
    tool: "bash",
    pattern: /rm\s+(-rf|-fr|-r\s+-f|-f\s+-r)\b/,
    reason: "递归强制删除不可恢复，请确认目标",
  },
  {
    tool: "bash",
    pattern: /\bsudo\b/,
    reason: "提权操作需明确授权",
  },
  {
    tool: "bash",
    pattern: /mkfs/,
    reason: "格式化文件系统不可逆",
  },
  {
    // 请外援：管道符后面站着 sh/bash
    tool: "bash",
    pattern: /curl[^|]*\|\s*(ba)?sh\b/,
    reason: "从网络拉取代码直接执行，来源不可信",
  },
  {
    tool: "bash",
    pattern: /\b(shutdown|reboot|halt|poweroff)\b/,
    reason: "关机/重启影响系统可用性",
  },
];

export const ASK_RULES: Rule[] = [
  {
    tool: "bash",
    pattern: /.*/,
    reason: "bash tool should ask for permission",
  },
  {
    tool: "write",
    pattern: /.*/,
    reason: "write tool should ask for permission",
  },
  {
    tool: "edit",
    pattern: /.*/,
    reason: "edit tool should ask for permission",
  },
];
```

现阶段 ask 对 bash / write / edit 全量兜底（`/.*/`），read / grep 这类只读工具默认放行。

### 2. checkPermission 第一版：审计对象不对

```ts title="permission.ts"
export const checkPermission = (
  tool: string,
  args: Record<string, unknown>,
): { decision: Decision; reason?: string } => {
  // 先查 DENY_RULES
  for (const rule of DENY_RULES) {
    if (rule.tool === tool && rule.pattern.test(JSON.stringify(args))) {
      return { decision: "deny", reason: rule.reason };
    }
  }

  // 再查 ASK_RULES
  for (const rule of ASK_RULES) {
    if (rule.tool === tool && rule.pattern.test(JSON.stringify(args))) {
      return { decision: "ask", reason: rule.reason };
    }
  }

  // 默认放行
  return { decision: "allow" };
};
```

这里的匹配对象是不对的：args 是 LLM 按我们的 schema 给的对象，规则想管的其实是其中的**具体字段**——bash 管的是命令串，文件工具管的是路径。直接 `JSON.stringify(args)` 拿序列化文本来 test，引号转义、字段名全混在被检文本里，误伤漏检都说不定。

所以需要一个单独的函数，先把"审计对象"提取出来，再做审计和处理。

### 3. auditTarget：先提取，再匹配

```ts title="permission.ts"
const auditTarget = (tool: string, args: Record<string, unknown>) => {
  if (tool === "bash") {
    return typeof args.command === "string" ? args.command : null;
  }
  if (
    tool === "read" ||
    tool === "write" ||
    tool === "edit" ||
    tool === "grep"
  ) {
    return typeof args.file === "string" ? args.file : null;
  }
  return null; // 陌生工具不认识 → 落进 fail-closed
};
```

然后改造 check：

```ts title="permission.ts"
export const checkPermission = (
  tool: string,
  args: Record<string, unknown>,
): { decision: Decision; reason?: string } => {
  const target = auditTarget(tool, args);
  if (target === null) {
    return { decision: "deny", reason: "未知工具或参数" };
  }
  // 先查 DENY_RULES
  for (const rule of DENY_RULES) {
    if (rule.tool === tool && rule.pattern.test(target)) {
      return { decision: "deny", reason: rule.reason };
    }
  }

  // 再查 ASK_RULES
  for (const rule of ASK_RULES) {
    if (rule.tool === tool && rule.pattern.test(target)) {
      return { decision: "ask", reason: rule.reason };
    }
  }

  // 默认放行
  return { decision: "allow" };
};
```

注意开头的 fail-closed：**提取不出审计对象（陌生工具、缺字段、类型不对）一律 deny**。权限这件事，默认拒绝是唯一安全的默认值。

### 4. checkPermission 的 UT

```ts title="permission.test.ts"
import { describe, test, expect } from "bun:test";
import { checkPermission } from "../permission";

describe("checkPermission", () => {
  // 行为1（白名单放行）：read 任意合法参数 → decision === "allow"
  test("should allow read tool with valid file", () => {
    const result = checkPermission("read", { file: "somefile.txt" });
    expect(result.decision).toBe("allow");
  });

  // 行为2（越界拒绝）：bash "rm -rf ." → "deny"，且 reason 非空
  test("should deny bash tool with dangerous command", () => {
    const result = checkPermission("bash", { command: "rm -rf ." });
    expect(result.decision).toBe("deny");
    expect(result.reason).toBeDefined();
  });

  // 行为3（敏感问人）：bash "git status" → "ask"；write / edit 任意 → "ask"
  test("should ask for bash tool with git status command", () => {
    const result = checkPermission("bash", { command: "git status" });
    expect(result.decision).toBe("ask");
  });

  // 行为4（deny 优先）：rm -rf 同时命中两表（ASK 的 /.*/ 也罩着它）→ 必须是 "deny"
  //                     —— 这是"先划边界"的字面测试，最重要的一条
  test("should deny bash tool with rm -rf command even if it matches ask rules", () => {
    const result = checkPermission("bash", { command: "rm -rf /" });
    expect(result.decision).toBe("deny");
  });

  // 行为5（fail-closed）：
  //   a. 陌生工具 "web_search" → "deny"
  //   b. bash 缺 command 字段 → "deny"
  //   c. bash { command: 123 } → "deny"   ← 类型不对也走 null
  test("should deny unknown tool", () => {
    const result = checkPermission("web_search", { query: "test" });
    expect(result.decision).toBe("deny");
  });

  test("should deny bash tool with missing command", () => {
    const result = checkPermission("bash", {});
    expect(result.decision).toBe("deny");
  });

  test("should deny bash tool with non-string command", () => {
    const result = checkPermission("bash", { command: 123 });
    expect(result.decision).toBe("deny");
  });

  // 行为6（deny 理由可溯源）：deny 的 reason === DENY 表里那条的原文
  //                          （回执素材要能对账，不许凭空捏造理由）
  test("should provide reason for denied bash tool", () => {
    const result = checkPermission("bash", { command: "rm -rf /" });
    expect(result.decision).toBe("deny");
    expect(result.reason).toBe("递归强制删除不可恢复，请确认目标");
  });
});
```

### 5. 接入 agent loop：is_error 回执

接入 loop 时有两个考虑：

1. 要能区分"工具自己抛的错误"和"我们人工塞入的裁决"——所以用上 `is_error` 字段，凡是补充的错误信息都是 true；
2. 权限判断和 catch 分开，避免职责重复。

```ts title="agent.ts"
const result = useTools.map((use) => {
  const toolName = use.name;

  const hasTool = Object.keys(registry).includes(toolName);

  let toolResult: unknown = "";
  // checkPermission
  const { decision, reason } = checkPermission(toolName, use.input);
  let is_error = false;
  if (hasTool) {
    try {
      if (decision === "deny") {
        toolResult = `Permission denied for tool ${toolName}: ${reason}`;
        is_error = true;
      } else if (decision === "ask") {
        toolResult = `Permission required for tool ${toolName}: ${reason}`;
      } else {
        // allow
        toolResult = registry[toolName].handler(use.input);
        is_error = false;
      }
    } catch (err) {
      toolResult = err instanceof Error ? err.message : String(err);
      is_error = true;
    }
  } else {
    toolResult = `not has this tool ${toolName}, we have some tools ${JSON.stringify(Object.keys(registry))}`;
    is_error = true;
  }

  return {
    tool_use_id: use.id,
    tool_name: toolName,
    is_error,
    result: toolResult,
  };
});

messages.push({
  role: "user",
  content: result.map((r) => ({
    type: "tool_result",
    tool_use_id: r.tool_use_id,
    content: toObservation(r.result),
    is_error: r.is_error,
  })),
});
```

### 6. deny 场景的 UT：handler 真没跑

前面都是查表的 UT，还要验证 loop 里落锤的瞬间——deny 之后 handler 是不是真的没执行。用一个"祭品文件"来验尸：

```ts title="agent.test.ts"
// 行为7：deny 落锤 → is_error 回执 + handler 真没跑
test("行为7：deny 落锤 → is_error 回执 + handler 真没跑", async () => {
  const sacrifice = resolve(import.meta.dir, "..", "probe-sacrifice.md"); // 你定祭品路径
  writeFileSync(sacrifice, "x");

  let count = 0;
  const fakeLlmFn = mock(
    async (messages: Message[], tools: Tool[]): Promise<LlmResponse> => {
      count++;
      if (count === 1) {
        return {
          content: [
            {
              type: "tool_use",
              id: "t10",
              name: "bash",
              input: { command: `rm -rf ${sacrifice}` },
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

  const backfilled = fakeLlmFn.mock.calls[1][0].at(-2)!;
  const block = (backfilled.content as ToolResultBlock[])[0];

  expect(block.is_error).toBe(true);
  expect(block.content).toContain("Permission denied");

  expect(existsSync(sacrifice)).toBe(true); // ← handler 真没跑，祭品还活着

  expect(fakeLlmFn.mock.calls.length).toBe(2);
});
```

### 7. ask 场景：问人的回调

deny 是机器说了算，ask 就需要人来拍板了。先补类型：

```ts title="types.ts"
type AskFn = (toolName: string, input: unknown, reason: string) => boolean;
```

然后改造 agent，把 `onAsk` 从 options 里解构进来（和 `llmFn` 一样走依赖注入，后面测试才好做）：

```ts title="agent.ts"
export async function agent(task: string, ops: Config) {
  const { maxTurns = 10, llmFn = callLlm, onAsk } = ops;
  //...

  if (decision === "ask") {
    // ask 不该在这里静默折成拒收，该停下来问人
    const approved = onAsk
      ? onAsk(toolName, use.input, reason ?? "<no reason provided>")
      : false;

    if (approved) {
      // 人批准 → 汇入 allow 同一条路：handler 就在外层 try 的保险区里
      toolResult = registry[toolName].handler(use.input);
    } else {
      // 人拒绝（或没人可问）→ deny 同款回执
      toolResult = `Permission denied for tool ${toolName} (refused by human): ${reason ?? "（法条未附理由）"}`;
      is_error = true;
    }
  }
}
```

关键设计：**没人可问（`onAsk` 缺席）等价于拒绝**——门不因为没人看管而自己开。

### 8. ask 的 UT

四个行为把 ask 的分支铺满。为了省篇幅，共用的假 LLM 骨架（第一轮让模型调 write 往祭品文件写内容，第二轮收工）只在行为 8 完整展示，后面只标差异：

```ts title="agent.test.ts"
// 行为8：人批准 → 工具真跑了
// onAsk 返回 true，顺带断言收到的现场三件套（toolName、input、reason）
test("行为8：人批准 → 工具真跑了", async () => {
  let count = 1;
  const fakeLlmFn = mock(
    async (messages: Message[]): Promise<LlmResponse> => {
      if (count === 1) {
        count++;
        return {
          content: [
            {
              type: "tool_use",
              id: "t11",
              name: "write",
              input: { file: "probe-ask.md", content: "approved content" },
            },
          ],
          stop_reason: "tool_use",
        };
      } else {
        return {
          content: [{ type: "text", text: "ok" }],
          stop_reason: "end_turn",
        };
      }
    },
  );

  await agent("test task", {
    llmFn: fakeLlmFn,
    onAsk: (toolName, input, reason) => {
      expect(toolName).toBe("write");
      expect(input).toEqual({
        file: "probe-ask.md",
        content: "approved content",
      });
      expect(reason).toBeTruthy();
      return true; // 人批准
    },
  });

  const backfilled = fakeLlmFn.mock.calls[1][0].at(-2)!;
  const block = (backfilled.content as ToolResultBlock[])[0];

  expect(block.is_error).toEqual(false);
  expect(block.tool_use_id).toEqual("t11");

  const sacrifice = resolve(Root, "probe-ask.md");
  expect(existsSync(sacrifice)).toBe(true); // 验尸①：文件出生了
  expect(readFileSync(sacrifice, "utf8")).toBe("approved content"); // 验尸②：内容对
  if (existsSync(sacrifice)) {
    rmSync(resolve(Root, "probe-ask.md"));
  }
});
```

```ts title="agent.test.ts"
// 行为9：人拒绝 → 嘴上应了，手上没动
// 骨架同行为 8，onAsk 改 return false
test("行为9：人拒绝 → 嘴上应了，手上没动", async () => {
  // ...fakeLlmFn 同行为 8，onAsk 的现场断言也相同，仅返回 false
  const block = /* 同样从 fakeLlmFn.mock.calls[1][0].at(-2) 取回执 */;

  expect(block.is_error).toEqual(true);
  expect(block.content).toContain("refused by human");

  const sacrifice = resolve(Root, "probe-ask.md");
  expect(existsSync(sacrifice)).toBe(false); // write 没执行，文件根本不该出生——和行为8恰好互补
});

// 行为10：没人可问 → 门不因没人而自己开
// 骨架同行为 8，改动一处：options 里干脆不插 onAsk
test("行为10：没人可问 → 门不因没人而自己开", async () => {
  // ...同剧本，agent("test task", { llmFn: fakeLlmFn })

  expect(block.is_error).toEqual(true);
  expect(block.content).toContain("refused by human");
  expect(existsSync(sacrifice)).toBe(false); // fail-closed 的成文法
});

// 行为11（王牌）：deny 先于 ask，边界不谈判
// 剧本换成 bash "rm -rf"（命中 DENY 表）；onAsk 只要被问就计数并批准
test("行为11（王牌）：deny 先于 ask，边界不谈判", async () => {
  // ...fakeLlmFn：第一轮 tool_use bash "rm -rf"，第二轮收工
  let askCount = 0;

  await agent("test task", {
    llmFn: fakeLlmFn,
    onAsk: () => {
      askCount++;
      return true; // 就算人什么都批
    },
  });

  const backfilled = fakeLlmFn.mock.calls[1][0].at(-2)!;
  const block = (backfilled.content as ToolResultBlock[])[0];

  expect(block.is_error).toEqual(true);
  expect(block.content).toContain("Permission denied for tool");
  expect(askCount).toEqual(0); // ← 压轴：人根本没被问过
});
```

行为 11 是压轴的一条：`rm -rf` 同时在 DENY 表和 ASK 表（`/.*/`）的射程内，但**人批不批都无所谓——它压根走不到问人那一步**。先划边界，边界不谈判。

## 小结

这套权限管线记住四句话就够了：

1. **调用前必查**：check 在 handler 之前，而不是出错之后补票；
2. **先提取，再匹配**：审计对象是命令串/路径这些具体字段，不是序列化后的 args 文本；
3. **fail-closed**：陌生工具、缺参数、没人可问——默认全 deny，门不因没人而自己开；
4. **deny 先于 ask**：硬边界不进协商流程，理由必须能溯源到规则表原文。
