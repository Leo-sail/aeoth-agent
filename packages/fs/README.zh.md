---
description: "文件系统提供方、工作区限制与文件工具。"
kind: "package-group"
---

# packages/fs

[English](README.md) | 中文

## 概述

文件系统提供方、工作区限制与文件工具。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-fs`](fs/README.zh.md) — Abstract filesystem capability seam (ctx.fs) for the Aeoth Agent — vocabulary types, the FileSystem service (text IO + optional version-guarded atomic mutations), and the fs/* policy event vocabulary
- [`@deepseek-ai/dsh-fs-local`](fs-local/README.zh.md) — Local-filesystem implementation of the Aeoth Agent filesystem seam (ctx.fs)
- [`@deepseek-ai/dsh-fs-observation-policy`](fs-observation-policy/README.zh.md) — File-context policy plugin for the Aeoth Agent — observed-state, read-before-edit, and version-guarded write/edit added over the ctx.fs provider seam through the fs/* event gate (no service API)
- [`@deepseek-ai/dsh-fs-sandbox`](fs-sandbox/README.zh.md) — Sandbox-enforcing implementation of the Aeoth Agent filesystem seam: fences write/edit by the per-call sandbox mode (read-only denies mutation, workspace-write contains it to the workspace + temp roots) while reads pass through
- [`@deepseek-ai/dsh-tool-fs`](tool-fs/README.zh.md) — Model-facing filesystem tools (read, write, edit) over the Aeoth Agent filesystem seam (ctx.fs)
- [`@deepseek-ai/dsh-tool-fs-search`](tool-fs-search/README.zh.md) — Model-facing filesystem discovery tools (glob, grep) backed by the packaged ripgrep binary (@vscode/ripgrep)
- [`@deepseek-ai/dsh-tool-str-replace-editor`](tool-str-replace-editor/README.zh.md) — Model-facing view, create, literal replace, and line insert tool over the Harness filesystem service

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
