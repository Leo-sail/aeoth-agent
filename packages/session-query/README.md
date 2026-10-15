---
description: "Session search, retrieval and export."
kind: "package-group"
---

# packages/session-query

English | [中文](README.zh.md)

## Overview

Session search, retrieval and export. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-session-log-export`](session-log-export/README.md) — Web Session-log export command and shared download dialog
- [`@deepseek-ai/dsh-session-query`](session-query/README.md) — Combined session query service contract with concrete reads, traces, and filters
- [`@deepseek-ai/dsh-session-query-sqlite`](session-query-sqlite/README.md) — Concrete ctx.sessionQuery backend with SQLite FTS5 search
- [`@deepseek-ai/dsh-tool-session-query`](tool-session-query/README.md) — Workspace-authorized model-facing session history search, trace, and event read tools

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
