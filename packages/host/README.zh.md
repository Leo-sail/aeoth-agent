---
description: "本地 Desktop 传输与操作系统服务。"
kind: "package-group"
---

# packages/host

[English](README.md) | 中文

## 概述

本地 Desktop 传输与操作系统服务。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-host-desktop-server`](desktop-server/README.zh.md) — Web route-registration plugin: HTTP and upgrade routes, index transform taps, and static dist fallback; knows no harness concepts
- [`@deepseek-ai/dsh-host-desktop-static`](desktop-static/README.zh.md) — SPA dist server for the Web shell: owns the webserver fallback seat, serving explicit index entries and static assets with traversal rejection and 404 misses
- [`@deepseek-ai/dsh-host-directory-picker`](directory-picker/README.zh.md) — Abstract workspace-directory picking seam (ctx.directoryPicker) for the Aeoth Agent Desktop UI host
- [`@deepseek-ai/dsh-host-directory-picker-auto`](directory-picker-auto/README.zh.md) — Adaptive chooser of the directory-picker seam: resolves the host situation at boot and mounts the native or browse backend for the Aeoth Agent Desktop UI host
- [`@deepseek-ai/dsh-host-directory-picker-browse`](directory-picker-browse/README.zh.md) — In-app browsing backend of the directory-picker seam (listing/creation primitives over the host filesystem)
- [`@deepseek-ai/dsh-host-directory-picker-native`](directory-picker-native/README.zh.md) — Native-OS-chooser backend of the directory-picker seam for the Aeoth Agent Desktop UI host
- [`@deepseek-ai/dsh-host-open-in-app`](open-in-app/README.zh.md) — Host half of open-in-app: resolved application catalog, icons, and the launch endpoint as three webServer routes
- [`@deepseek-ai/dsh-host-plugin-inventory`](plugin-inventory/README.zh.md) — Read-only Remote projection of current Cordis Loader plugin state
- [`@deepseek-ai/dsh-host-product-telemetry-otel`](product-telemetry-otel/README.zh.md) — Explicit product usage events exported through OpenTelemetry HTTP logs

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
