---
description: "Filesystem providers, workspace confinement and file tools."
kind: "package-group"
---

# packages/fs

English | [中文](README.zh.md)

## Overview

Filesystem providers, workspace confinement and file tools. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-fs`](fs/README.md) — Abstract filesystem capability seam (ctx.fs) for the Aeoth Agent — vocabulary types, the FileSystem service (text IO + optional version-guarded atomic mutations), and the fs/* policy event vocabulary
- [`@deepseek-ai/dsh-fs-local`](fs-local/README.md) — Local-filesystem implementation of the Aeoth Agent filesystem seam (ctx.fs)
- [`@deepseek-ai/dsh-fs-observation-policy`](fs-observation-policy/README.md) — File-context policy plugin for the Aeoth Agent — observed-state, read-before-edit, and version-guarded write/edit added over the ctx.fs provider seam through the fs/* event gate (no service API)
- [`@deepseek-ai/dsh-fs-sandbox`](fs-sandbox/README.md) — Sandbox-enforcing implementation of the Aeoth Agent filesystem seam: fences write/edit by the per-call sandbox mode (read-only denies mutation, workspace-write contains it to the workspace + temp roots) while reads pass through
- [`@deepseek-ai/dsh-tool-fs`](tool-fs/README.md) — Model-facing filesystem tools (read, write, edit) over the Aeoth Agent filesystem seam (ctx.fs)
- [`@deepseek-ai/dsh-tool-fs-search`](tool-fs-search/README.md) — Model-facing filesystem discovery tools (glob, grep) backed by the packaged ripgrep binary (@vscode/ripgrep)
- [`@deepseek-ai/dsh-tool-str-replace-editor`](tool-str-replace-editor/README.md) — Model-facing view, create, literal replace, and line insert tool over the Harness filesystem service

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
