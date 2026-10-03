---
description: "运行时插件创建与有边界的扩展执行。"
kind: "package-group"
---

# packages/extensions

[English](README.md) | 中文

## 概述

运行时插件创建与有边界的扩展执行。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-cordis-client-runner`](cordis-client-runner/README.zh.md) — Browser half of dynamic dual-half plugin packages: event subscription, closure evaluation, guard facade, and loader entries
- [`@deepseek-ai/dsh-cordis-host-runner`](cordis-host-runner/README.zh.md) — Dynamic package definition registry, host-half sandbox lifecycle, and invoke handler table for model-mounted dual-half packages
- [`@deepseek-ai/dsh-tool-cordis`](tool-cordis/README.zh.md) — Read-only runtime API inspection for Harness plugin development
- [`@deepseek-ai/dsh-client-ui-cordis`](ui-cordis/README.zh.md) — Cordis dynamic-plugin definition card: the keyed cordis_define tool row with its run/stop switch

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
