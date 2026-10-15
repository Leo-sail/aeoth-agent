---
description: "Workspace instructions and model request context."
kind: "package-group"
---

# packages/context

English | [中文](README.zh.md)

## Overview

Workspace instructions and model request context. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-agent-instructions`](agent-instructions/README.md) — Workspace context loader for AGENTS.md/CLAUDE.md instruction files
- [`@deepseek-ai/dsh-file-reference`](file-reference/README.md) — File-reference discovery contract and shared @file grammar
- [`@deepseek-ai/dsh-file-reference-local`](file-reference-local/README.md) — Local-filesystem ctx.fileReferences provider with bounded fuzzy indexes
- [`@deepseek-ai/dsh-session-reference`](session-reference/README.md) — Cross-session snapshot references and durable untrusted model context (ctx.sessionReferenceResolver)
- [`@deepseek-ai/dsh-time-context`](time-context/README.md) — Durable per-step context with the current time and elapsed time
- [`@deepseek-ai/dsh-tmux-context`](tmux-context/README.md) — Opt-in durable per-step context with this agent's tmux pane and window location

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
