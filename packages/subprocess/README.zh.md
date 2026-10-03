---
description: "受管子进程、输出与进程树清理。"
kind: "package-group"
---

# packages/subprocess

[English](README.md) | 中文

## 概述

受管子进程、输出与进程树清理。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-subprocess`](subprocess/README.zh.md) — Subprocess seam (ctx.subprocess) for the Aeoth Agent — managed process groups, bounded spill-backed output, and escalated kills behind one abstract service
- [`@deepseek-ai/dsh-subprocess-local`](subprocess-local/README.zh.md) — Local-subprocess implementation of the Aeoth Agent subprocess seam
- [`@deepseek-ai/dsh-win32-process`](win32-process/README.zh.md) — Shared low-level Win32 process, stdio, and Job Object primitives

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
