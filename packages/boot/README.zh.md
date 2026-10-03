---
description: "Profile 加载、配置变更与插件生命周期。"
kind: "package-group"
---

# packages/boot

[English](README.md) | 中文

## 概述

Profile 加载、配置变更与插件生命周期。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-app-boot`](app-boot/README.zh.md) — Shared boot glue for the app bins: .env loading, fail-loud Loader guards, snapshot-aware config resolution, and the Loader boot sequence
- [`@deepseek-ai/dsh-config-editor`](config-editor/README.zh.md) — Persist plugin configuration through profile patches and Loader reconciliation
- [`@deepseek-ai/dsh-hmr`](hmr/README.zh.md) — Coordinated module and profile configuration hot reload
- [`@deepseek-ai/dsh-plugin-manager`](plugin-manager/README.zh.md) — Current-profile plugin and bundle management shared by dsh CLI, Web and agent tools

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
