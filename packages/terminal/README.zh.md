---
description: "持久 PTY 会话与交互终端工具。"
kind: "package-group"
---

# packages/terminal

[English](README.md) | 中文

## 概述

持久 PTY 会话与交互终端工具。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-terminal`](terminal/README.zh.md) — Persistent PTY session seam for the Aeoth Agent — owner-scoped ids, backend registry, interactive sends, reads, signals, and awaited cleanup
- [`@deepseek-ai/dsh-terminal-bash`](terminal-bash/README.zh.md) — Persistent shell PTY backend over the Aeoth Agent subprocess terminal primitive
- [`@deepseek-ai/dsh-tool-terminal`](tool-terminal/README.zh.md) — Six model-facing persistent PTY tools with owner isolation and generic background-job integration

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
