---
description: "Execution deadlines and repeated-call reminders."
kind: "package-group"
---

# packages/guard

English | [中文](README.zh.md)

## Overview

Execution deadlines and repeated-call reminders. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-repeat-tool-reminder`](repeat-tool-reminder/README.md) — Repeat-tool-call guard plugin: advisory reminders when an agent loops on identical tool calls
- [`@deepseek-ai/dsh-tool-call-timeout-policy`](timeout-policy/README.md) — Tool-call timeout policy: a tools/execute wrapper that arms a per-tool deadline on exec.signal and returns TOOL_TIMEOUT when it wins

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
