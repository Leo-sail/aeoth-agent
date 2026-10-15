---
description: "Profile loading, configuration changes and plugin lifecycle."
kind: "package-group"
---

# packages/boot

English | [中文](README.zh.md)

## Overview

Profile loading, configuration changes and plugin lifecycle. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-app-boot`](app-boot/README.md) — Shared boot glue for the app bins: .env loading, fail-loud Loader guards, snapshot-aware config resolution, and the Loader boot sequence
- [`@deepseek-ai/dsh-config-editor`](config-editor/README.md) — Persist plugin configuration through profile patches and Loader reconciliation
- [`@deepseek-ai/dsh-hmr`](hmr/README.md) — Coordinated module and profile configuration hot reload
- [`@deepseek-ai/dsh-plugin-manager`](plugin-manager/README.md) — Current-profile plugin and bundle management shared by dsh CLI, Web and agent tools

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
