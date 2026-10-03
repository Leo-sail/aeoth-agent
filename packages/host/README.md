---
description: "Local Desktop transport and operating-system services."
kind: "package-group"
---

# packages/host

English | [中文](README.zh.md)

## Overview

Local Desktop transport and operating-system services. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-host-desktop-server`](desktop-server/README.md) — Web route-registration plugin: HTTP and upgrade routes, index transform taps, and static dist fallback; knows no harness concepts
- [`@deepseek-ai/dsh-host-desktop-static`](desktop-static/README.md) — SPA dist server for the Web shell: owns the webserver fallback seat, serving explicit index entries and static assets with traversal rejection and 404 misses
- [`@deepseek-ai/dsh-host-directory-picker`](directory-picker/README.md) — Abstract workspace-directory picking seam (ctx.directoryPicker) for the Aeoth Agent Desktop UI host
- [`@deepseek-ai/dsh-host-directory-picker-auto`](directory-picker-auto/README.md) — Adaptive chooser of the directory-picker seam: resolves the host situation at boot and mounts the native or browse backend for the Aeoth Agent Desktop UI host
- [`@deepseek-ai/dsh-host-directory-picker-browse`](directory-picker-browse/README.md) — In-app browsing backend of the directory-picker seam (listing/creation primitives over the host filesystem)
- [`@deepseek-ai/dsh-host-directory-picker-native`](directory-picker-native/README.md) — Native-OS-chooser backend of the directory-picker seam for the Aeoth Agent Desktop UI host
- [`@deepseek-ai/dsh-host-open-in-app`](open-in-app/README.md) — Host half of open-in-app: resolved application catalog, icons, and the launch endpoint as three webServer routes
- [`@deepseek-ai/dsh-host-plugin-inventory`](plugin-inventory/README.md) — Read-only Remote projection of current Cordis Loader plugin state
- [`@deepseek-ai/dsh-host-product-telemetry-otel`](product-telemetry-otel/README.md) — Explicit product usage events exported through OpenTelemetry HTTP logs

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
