---
description: "进程内 Agent 委派与继续执行控制。"
kind: "package-group"
---

# packages/subagent

[English](README.md) | 中文

## 概述

进程内 Agent 委派与继续执行控制。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-subagent`](subagent/README.zh.md) — Abstract subagent seam (ctx.subagents): named-provider registry for delegating to child agents
- [`@deepseek-ai/dsh-subagent-fork-in-process`](subagent-fork-in-process/README.zh.md) — In-process fork subagent backend: runs a child agent seeded with a prefix of the parent's log
- [`@deepseek-ai/dsh-subagent-in-process-driver`](subagent-in-process-driver/README.zh.md) — Shared in-process subagent run driver: drives a child agent on ctx.agents (used by the spawn and fork backends)
- [`@deepseek-ai/dsh-subagent-spawn-in-process`](subagent-spawn-in-process/README.zh.md) — In-process spawn subagent backend: runs a fresh child agent on ctx.agents
- [`@deepseek-ai/dsh-tool-subagent`](tool-subagent/README.zh.md) — Model-facing subagent delegation tool over the ctx.subagents seam
- [`@deepseek-ai/dsh-tool-subagent-control`](tool-subagent-control/README.zh.md) — Globally named send_message, interrupt_agent, and list_agents tools over ctx.subagents continuations

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
