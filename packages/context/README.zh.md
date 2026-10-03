---
description: "工作区指令与模型请求上下文。"
kind: "package-group"
---

# packages/context

[English](README.md) | 中文

## 概述

工作区指令与模型请求上下文。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-agent-instructions`](agent-instructions/README.zh.md) — Workspace context loader for AGENTS.md/CLAUDE.md instruction files
- [`@deepseek-ai/dsh-file-reference`](file-reference/README.zh.md) — File-reference discovery contract and shared @file grammar
- [`@deepseek-ai/dsh-file-reference-local`](file-reference-local/README.zh.md) — Local-filesystem ctx.fileReferences provider with bounded fuzzy indexes
- [`@deepseek-ai/dsh-session-reference`](session-reference/README.zh.md) — Cross-session snapshot references and durable untrusted model context (ctx.sessionReferenceResolver)
- [`@deepseek-ai/dsh-time-context`](time-context/README.zh.md) — Durable per-step context with the current time and elapsed time
- [`@deepseek-ai/dsh-tmux-context`](tmux-context/README.zh.md) — Opt-in durable per-step context with this agent's tmux pane and window location

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
