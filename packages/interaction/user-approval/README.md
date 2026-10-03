---
description: "User-approval seam (ctx.approval) for the Aeoth Agent: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default"
kind: "package-reference"
---

# @deepseek-ai/dsh-user-approval

English | [中文](README.zh.md)

## Overview

User-approval seam (ctx.approval) for the Aeoth Agent: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default This package is part of the Aeoth Desktop runtime and is consumed by the application-owned Host or renderer.

## Use this package

- **Scope:** `packages/interaction/user-approval` owns this capability boundary.
- **Entry points:** runtime code is exported through `lib/index.js`; public types are exported through `lib/types/index.d.ts` when present.
- **Product boundary:** the Electron Desktop application is the product entry point; this page documents the package contract.

## Integration

- **Runtime peers:** declared in `package.json`.
- **Package family:** see the [parent package map](../README.md).
- **Lifecycle:** the consuming Desktop profile or Host/Client layer owns composition and cleanup.

## Source

- [`src/`](src/) — implementation and public source contracts.
- [`package.json`](package.json) — exports, dependencies and publication metadata.
- The full composition is built with `pnpm run build:official`.

## Desktop delivery

- This package is retained as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [`THIRD_PARTY_NOTICES.md`](../../../THIRD_PARTY_NOTICES.md).
