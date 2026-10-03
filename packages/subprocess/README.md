---
description: "Managed subprocesses, output and process-tree cleanup."
kind: "package-group"
---

# packages/subprocess

English | [中文](README.zh.md)

## Overview

Managed subprocesses, output and process-tree cleanup. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-subprocess`](subprocess/README.md) — Subprocess seam (ctx.subprocess) for the Aeoth Agent — managed process groups, bounded spill-backed output, and escalated kills behind one abstract service
- [`@deepseek-ai/dsh-subprocess-local`](subprocess-local/README.md) — Local-subprocess implementation of the Aeoth Agent subprocess seam
- [`@deepseek-ai/dsh-win32-process`](win32-process/README.md) — Shared low-level Win32 process, stdio, and Job Object primitives

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
