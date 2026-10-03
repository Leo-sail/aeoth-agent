---
description: "Private application runtime and renderer entry points."
kind: "package-group"
---

# packages/desktop

English | [中文](README.zh.md)

## Overview

Private application runtime and renderer entry points. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-desktop-frontend`](frontend/README.md) — Aeoth Agent Desktop renderer entry: Vite builds the Electron application shell
- [`@deepseek-ai/dsh`](runtime/README.md) — Aeoth Agent Desktop runtime: profile composition and lifecycle for the Electron application

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
