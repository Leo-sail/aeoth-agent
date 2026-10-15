---
description: "User approval, questions and conversation commands."
kind: "package-group"
---

# packages/interaction

English | [中文](README.zh.md)

## Overview

User approval, questions and conversation commands. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-commands`](commands/README.md) — Plugin-owned human command registry for Aeoth Agent UIs
- [`@deepseek-ai/dsh-permission-presets`](permission-presets/README.md) — User-facing permission presets (ctx.permissionPresets) for the Aeoth Agent: one product-level Permissions select bundling the sandbox-mode and approval-policy knobs, written through to their own session events
- [`@deepseek-ai/dsh-tool-ask-user`](tool-ask-user/README.md) — Model-facing ask_user_question tool over the ctx.userQuestions seam
- [`@deepseek-ai/dsh-user-approval`](user-approval/README.md) — User-approval seam (ctx.approval) for the Aeoth Agent: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default
- [`@deepseek-ai/dsh-user-questions`](user-questions/README.md) — Abstract user-questions seam (ctx.userQuestions) for asking the human during agent runs

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
