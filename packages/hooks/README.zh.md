---
description: "Hook 协议与既有集成的适配器。"
kind: "package-group"
---

# packages/hooks

[English](README.md) | 中文

## 概述

Hook 协议与既有集成的适配器。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-hook-protocol`](hook-protocol/README.zh.md) — Shared Claude Code / Codex hook wire protocol: matcher engine, stdin/exit-code/stdout codec, multi-hook merge, and hook/* session events
- [`@deepseek-ai/dsh-hooks-claude-code`](hooks-claude-code/README.zh.md) — Bridge plugin: run a Claude Code hooks.json / settings hook config on the Aeoth Agent interception seams
- [`@deepseek-ai/dsh-hooks-codex`](hooks-codex/README.zh.md) — Bridge plugin: run a Codex hooks.json hook config on the Aeoth Agent interception seams

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
