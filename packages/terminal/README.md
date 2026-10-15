---
description: "Persistent PTY sessions and interactive terminal tools."
kind: "package-group"
---

# packages/terminal

English | [中文](README.zh.md)

## Overview

Persistent PTY sessions and interactive terminal tools. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-terminal`](terminal/README.md) — Persistent PTY session seam for the Aeoth Agent — owner-scoped ids, backend registry, interactive sends, reads, signals, and awaited cleanup
- [`@deepseek-ai/dsh-terminal-bash`](terminal-bash/README.md) — Persistent shell PTY backend over the Aeoth Agent subprocess terminal primitive
- [`@deepseek-ai/dsh-tool-terminal`](tool-terminal/README.md) — Six model-facing persistent PTY tools with owner isolation and generic background-job integration

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
