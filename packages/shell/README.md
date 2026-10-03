---
description: "Shell execution, environment handling and model-facing commands."
kind: "package-group"
---

# packages/shell

English | [中文](README.zh.md)

## Overview

Shell execution, environment handling and model-facing commands. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-bash-local`](bash-local/README.md) — Local-subprocess implementation of the Aeoth Agent bash executor seam
- [`@deepseek-ai/dsh-bash-sandbox`](bash-sandbox/README.md) — Sandbox-consuming implementation of the Aeoth Agent bash executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts)
- [`@deepseek-ai/dsh-pwsh-local`](pwsh-local/README.md) — Local PowerShell implementation of the Aeoth Agent bash executor seam
- [`@deepseek-ai/dsh-pwsh-sandbox`](pwsh-sandbox/README.md) — Sandbox-consuming implementation of the Aeoth Agent PowerShell executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts)
- [`@deepseek-ai/dsh-shell`](shell/README.md) — Abstract bash executor seam (ctx.shell) for the Aeoth Agent
- [`@deepseek-ai/dsh-shell-env`](shell-env/README.md) — Tool-independent managed DSH_* shell environment registry
- [`@deepseek-ai/dsh-tool-bash`](tool-bash/README.md) — Model-facing bash tool with optional generic background-job and sandbox-escalation support
- [`@deepseek-ai/dsh-tool-bash-persistent`](tool-bash-persistent/README.md) — Model-facing owner-scoped persistent Bash tool backed by the Harness PTY service
- [`@deepseek-ai/dsh-tool-pwsh`](tool-pwsh/README.md) — Model-facing pwsh tool over the bash executor seam
- [`@deepseek-ai/dsh-tool-pwsh-persistent`](tool-pwsh-persistent/README.md) — Model-facing owner-scoped persistent PowerShell tool backed by the Harness PTY service

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
