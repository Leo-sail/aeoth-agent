---
description: "Hook protocols and adapters for existing integrations."
kind: "package-group"
---

# packages/hooks

English | [中文](README.zh.md)

## Overview

Hook protocols and adapters for existing integrations. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-hook-protocol`](hook-protocol/README.md) — Shared Claude Code / Codex hook wire protocol: matcher engine, stdin/exit-code/stdout codec, multi-hook merge, and hook/* session events
- [`@deepseek-ai/dsh-hooks-claude-code`](hooks-claude-code/README.md) — Bridge plugin: run a Claude Code hooks.json / settings hook config on the Aeoth Agent interception seams
- [`@deepseek-ai/dsh-hooks-codex`](hooks-codex/README.md) — Bridge plugin: run a Codex hooks.json hook config on the Aeoth Agent interception seams

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
