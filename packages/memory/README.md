---
description: "Long-term memory providers, tools and management operations."
kind: "package-group"
---

# packages/memory

English | [中文](README.zh.md)

## Overview

Long-term memory providers, tools and management operations. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-command-memory`](command-memory/README.md) — Human-facing slash command for profile-scoped MEMORY and USER entries
- [`@deepseek-ai/dsh-memory-mcp`](mcp/README.md) — External MCP-backed MemoryProvider adapter for the Aeoth memory contract
- [`@deepseek-ai/dsh-memory`](memory/README.md) — Profile-scoped MEMORY/USER long-term memory registry and provider contract
- [`@deepseek-ai/dsh-memory-filesystem`](memory-filesystem/README.md) — Native profile-scoped MEMORY.md and USER.md provider
- [`@deepseek-ai/dsh-memory-migration`](migration/README.md) — Previewable, confirmable, and reversible migration of legacy MCP memory exports
- [`@deepseek-ai/dsh-tool-memory`](tool-memory/README.md) — Model-facing MEMORY/USER long-term memory tool

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
