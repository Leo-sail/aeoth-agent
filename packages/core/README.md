---
description: "Agent execution, Session events, tools and prompt assembly."
kind: "package-group"
---

# packages/core

English | [中文](README.zh.md)

## Overview

Agent execution, Session events, tools and prompt assembly. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-agent`](agent/README.md) — Agent interface, registry, initiator scope, and event vocabulary for the Aeoth Agent
- [`@deepseek-ai/dsh-agent-community`](agent-community/README.md) — Native Bot Mode community, durable rooms, bot runs, and live control
- [`@deepseek-ai/dsh-agent-default-model`](agent-default-model/README.md) — Default model selection shared by Agent entry points
- [`@deepseek-ai/dsh-agent-link`](agent-link/README.md) — Native bidirectional A2A client, task registry, and Agent Card contract
- [`@deepseek-ai/dsh-agent-loop`](agent-loop/README.md) — The concrete agent loop plugin for the Aeoth Agent
- [`@deepseek-ai/dsh-agent-tool-presentation`](agent-tool-presentation/README.md) — Agent-plane presentation selector: composes one agent's tools as PTC mode, native, or both
- [`@deepseek-ai/dsh-scope`](scope/README.md) — Scoped-context registration primitive (scope tags, scope-filtered event dispatch) for the Aeoth Agent
- [`@deepseek-ai/dsh-session`](session/README.md) — Event-sourced session store for the Aeoth Agent
- [`@deepseek-ai/dsh-system-prompt`](system-prompt/README.md) — System prompt assembly registry for Aeoth Agent
- [`@deepseek-ai/dsh-tools`](tools/README.md) — Tool registry and execution pipeline for the Aeoth Agent

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
