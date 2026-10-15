---
description: "执行时限与重复调用提醒。"
kind: "package-group"
---

# packages/guard

[English](README.md) | 中文

## 概述

执行时限与重复调用提醒。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-repeat-tool-reminder`](repeat-tool-reminder/README.zh.md) — Repeat-tool-call guard plugin: advisory reminders when an agent loops on identical tool calls
- [`@deepseek-ai/dsh-tool-call-timeout-policy`](timeout-policy/README.zh.md) — Tool-call timeout policy: a tools/execute wrapper that arms a per-tool deadline on exec.signal and returns TOOL_TIMEOUT when it wins

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
