---
description: "持久目标与同一 Session 内的继续执行。"
kind: "package-group"
---

# packages/goal

[English](README.md) | 中文

## 概述

持久目标与同一 Session 内的继续执行。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-command-goal`](command-goal/README.zh.md) — Human-facing slash command for persisted same-session goals
- [`@deepseek-ai/dsh-goal`](goal/README.zh.md) — Event-sourced same-session goal state and lifecycle service for the Aeoth Agent
- [`@deepseek-ai/dsh-goal-round-driver`](goal-round-driver/README.zh.md) — Race-fenced same-session goal-round driver
- [`@deepseek-ai/dsh-tool-goal`](tool-goal/README.zh.md) — Model-facing same-session goal tools with execution-time authority checks

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
