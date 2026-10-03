---
description: "Runtime plugin creation and bounded extension execution."
kind: "package-group"
---

# packages/extensions

English | [中文](README.zh.md)

## Overview

Runtime plugin creation and bounded extension execution. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-cordis-client-runner`](cordis-client-runner/README.md) — Browser half of dynamic dual-half plugin packages: event subscription, closure evaluation, guard facade, and loader entries
- [`@deepseek-ai/dsh-cordis-host-runner`](cordis-host-runner/README.md) — Dynamic package definition registry, host-half sandbox lifecycle, and invoke handler table for model-mounted dual-half packages
- [`@deepseek-ai/dsh-tool-cordis`](tool-cordis/README.md) — Read-only runtime API inspection for Harness plugin development
- [`@deepseek-ai/dsh-client-ui-cordis`](ui-cordis/README.md) — Cordis dynamic-plugin definition card: the keyed cordis_define tool row with its run/stop switch

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
