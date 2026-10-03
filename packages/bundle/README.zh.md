---
description: "基础运行时与桌面应用组合。"
kind: "package-group"
---

# packages/bundle

[English](README.md) | 中文

## 概述

基础运行时与桌面应用组合。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-base`](base/README.zh.md) — The shared dsh core as a profile bundle: the first patch layer of base-backed profiles, inserting core rows over the empty profile root
- [`@deepseek-ai/dsh-desktop-app`](desktop-app/README.zh.md) — The dsh desktop application surface bundle: the web patch layer over dsh-base plus the runtime glue plugin (frontend dist serving, web-surface prompt, bash runtime variables, URL line)

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
