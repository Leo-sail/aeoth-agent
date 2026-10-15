---
description: "Base runtime and Desktop application composition."
kind: "package-group"
---

# packages/bundle

English | [中文](README.zh.md)

## Overview

Base runtime and Desktop application composition. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-base`](base/README.md) — The shared dsh core as a profile bundle: the first patch layer of base-backed profiles, inserting core rows over the empty profile root
- [`@deepseek-ai/dsh-desktop-app`](desktop-app/README.md) — The dsh desktop application surface bundle: the web patch layer over dsh-base plus the runtime glue plugin (frontend dist serving, web-surface prompt, bash runtime variables, URL line)

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
