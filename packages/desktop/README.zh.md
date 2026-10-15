---
description: "应用私有运行时与渲染器入口。"
kind: "package-group"
---

# packages/desktop

[English](README.md) | 中文

## 概述

应用私有运行时与渲染器入口。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-desktop-frontend`](frontend/README.zh.md) — Aeoth Agent Desktop renderer entry: Vite builds the Electron application shell
- [`@deepseek-ai/dsh`](runtime/README.zh.md) — Aeoth Agent Desktop runtime: profile composition and lifecycle for the Electron application

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
