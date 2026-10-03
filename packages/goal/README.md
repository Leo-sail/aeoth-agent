---
description: "Persistent goals and continuation within a Session."
kind: "package-group"
---

# packages/goal

English | [中文](README.zh.md)

## Overview

Persistent goals and continuation within a Session. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-command-goal`](command-goal/README.md) — Human-facing slash command for persisted same-session goals
- [`@deepseek-ai/dsh-goal`](goal/README.md) — Event-sourced same-session goal state and lifecycle service for the Aeoth Agent
- [`@deepseek-ai/dsh-goal-round-driver`](goal-round-driver/README.md) — Race-fenced same-session goal-round driver
- [`@deepseek-ai/dsh-tool-goal`](tool-goal/README.md) — Model-facing same-session goal tools with execution-time authority checks

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
