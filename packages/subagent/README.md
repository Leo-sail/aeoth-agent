---
description: "In-process Agent delegation and continuation controls."
kind: "package-group"
---

# packages/subagent

English | [中文](README.zh.md)

## Overview

In-process Agent delegation and continuation controls. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-subagent`](subagent/README.md) — Abstract subagent seam (ctx.subagents): named-provider registry for delegating to child agents
- [`@deepseek-ai/dsh-subagent-fork-in-process`](subagent-fork-in-process/README.md) — In-process fork subagent backend: runs a child agent seeded with a prefix of the parent's log
- [`@deepseek-ai/dsh-subagent-in-process-driver`](subagent-in-process-driver/README.md) — Shared in-process subagent run driver: drives a child agent on ctx.agents (used by the spawn and fork backends)
- [`@deepseek-ai/dsh-subagent-spawn-in-process`](subagent-spawn-in-process/README.md) — In-process spawn subagent backend: runs a fresh child agent on ctx.agents
- [`@deepseek-ai/dsh-tool-subagent`](tool-subagent/README.md) — Model-facing subagent delegation tool over the ctx.subagents seam
- [`@deepseek-ai/dsh-tool-subagent-control`](tool-subagent-control/README.md) — Globally named send_message, interrupt_agent, and list_agents tools over ctx.subagents continuations

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
