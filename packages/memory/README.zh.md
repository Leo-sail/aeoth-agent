---
description: "长期记忆提供方、工具与管理操作。"
kind: "package-group"
---

# packages/memory

[English](README.md) | 中文

## 概述

长期记忆提供方、工具与管理操作。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-command-memory`](command-memory/README.zh.md) — Human-facing slash command for profile-scoped MEMORY and USER entries
- [`@deepseek-ai/dsh-memory-mcp`](mcp/README.zh.md) — External MCP-backed MemoryProvider adapter for the Aeoth memory contract
- [`@deepseek-ai/dsh-memory`](memory/README.zh.md) — Profile-scoped MEMORY/USER long-term memory registry and provider contract
- [`@deepseek-ai/dsh-memory-filesystem`](memory-filesystem/README.zh.md) — Native profile-scoped MEMORY.md and USER.md provider
- [`@deepseek-ai/dsh-memory-migration`](migration/README.zh.md) — Previewable, confirmable, and reversible migration of legacy MCP memory exports
- [`@deepseek-ai/dsh-tool-memory`](tool-memory/README.zh.md) — Model-facing MEMORY/USER long-term memory tool

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
