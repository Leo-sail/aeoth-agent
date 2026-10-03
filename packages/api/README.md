---
description: "Typed Host operations used by the Desktop renderer."
kind: "package-group"
---

# packages/api

English | [中文](README.zh.md)

## Overview

Typed Host operations used by the Desktop renderer. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-api-account-controller`](account-controller/README.md) — Expose safe account operations over authenticated Remote
- [`@deepseek-ai/dsh-api-agent-community`](agent-community/README.md) — Native Bot Mode and Agent Community Remote namespace
- [`@deepseek-ai/dsh-api-agent-link`](agent-link/README.md) — Native A2A HTTP adapter for Aeoth Agent Link
- [`@deepseek-ai/dsh-api-gateway`](gateway/README.md) — Typert Remote Host dispatcher and Client API endpoint
- [`@deepseek-ai/dsh-api-job-controller`](job-controller/README.md) — Job Remote observation stream and the reference-counted client job-output service
- [`@deepseek-ai/dsh-api-memory-controller`](memory-controller/README.md) — Memory and skill management Remote namespace for Desktop runtime
- [`@deepseek-ai/dsh-api-remotes`](remotes/README.md) — Remote BFF assembly for application-selected Host capabilities
- [`@deepseek-ai/dsh-api-session-controller`](session-controller/README.md) — Session Remote commands, cold reads, and live control transport
- [`@deepseek-ai/dsh-api-settings-controller`](settings-controller/README.md) — Remote owner for the configuration surfaces over the settings-domain seams
- [`@deepseek-ai/dsh-api-terminal-controller`](terminal-controller/README.md) — Session-owned interactive terminals with shell discovery, screen recovery and typed Remote control
- [`@deepseek-ai/dsh-api-workspace-controller`](workspace-controller/README.md) — Workspace Remote commands and reconnect-safe state transport
- [`@deepseek-ai/dsh-api-workspace-files`](workspace-files/README.md) — Workspace file service and Client resource provider: bounded reads, directory listing, and live metadata over the workspaceFiles Remote namespace

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
