---
description: "把已验证的外部事件接入 Workspace Session。"
kind: "package-group"
---

# packages/webhook

[English](README.md) | 中文

## 概述

把已验证的外部事件接入 Workspace Session。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-webhook`](webhook/README.zh.md) — Fire-and-forget webhook rule runtime that creates Workspace-backed Aeoth Agent Sessions
- [`@deepseek-ai/dsh-webhook-github`](webhook-github/README.zh.md) — Signed GitHub HTTP webhook adapter for the Aeoth Agent webhook runtime

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
