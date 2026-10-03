---
description: "用户审批、提问与对话命令。"
kind: "package-group"
---

# packages/interaction

[English](README.md) | 中文

## 概述

用户审批、提问与对话命令。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-commands`](commands/README.zh.md) — Plugin-owned human command registry for Aeoth Agent UIs
- [`@deepseek-ai/dsh-permission-presets`](permission-presets/README.zh.md) — User-facing permission presets (ctx.permissionPresets) for the Aeoth Agent: one product-level Permissions select bundling the sandbox-mode and approval-policy knobs, written through to their own session events
- [`@deepseek-ai/dsh-tool-ask-user`](tool-ask-user/README.zh.md) — Model-facing ask_user_question tool over the ctx.userQuestions seam
- [`@deepseek-ai/dsh-user-approval`](user-approval/README.zh.md) — User-approval seam (ctx.approval) for the Aeoth Agent: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default
- [`@deepseek-ai/dsh-user-questions`](user-questions/README.zh.md) — Abstract user-questions seam (ctx.userQuestions) for asking the human during agent runs

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
