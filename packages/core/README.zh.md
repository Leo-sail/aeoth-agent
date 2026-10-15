---
description: "Agent 执行、Session 事件、工具与提示词组装。"
kind: "package-group"
---

# packages/core

[English](README.md) | 中文

## 概述

Agent 执行、Session 事件、工具与提示词组装。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-agent`](agent/README.zh.md) — Agent interface, registry, initiator scope, and event vocabulary for the Aeoth Agent
- [`@deepseek-ai/dsh-agent-default-model`](agent-default-model/README.zh.md) — Default model selection shared by Agent entry points
- [`@deepseek-ai/dsh-agent-loop`](agent-loop/README.zh.md) — The concrete agent loop plugin for the Aeoth Agent
- [`@deepseek-ai/dsh-agent-tool-presentation`](agent-tool-presentation/README.zh.md) — Agent-plane presentation selector: composes one agent's tools as PTC mode, native, or both
- [`@deepseek-ai/dsh-scope`](scope/README.zh.md) — Scoped-context registration primitive (scope tags, scope-filtered event dispatch) for the Aeoth Agent
- [`@deepseek-ai/dsh-session`](session/README.zh.md) — Event-sourced session store for the Aeoth Agent
- [`@deepseek-ai/dsh-system-prompt`](system-prompt/README.zh.md) — System prompt assembly registry for Aeoth Agent
- [`@deepseek-ai/dsh-tools`](tools/README.zh.md) — Tool registry and execution pipeline for the Aeoth Agent

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
