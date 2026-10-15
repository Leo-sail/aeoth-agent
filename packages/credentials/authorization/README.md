---
description: "Authorization seam for plugin-owned flows that obtain a credential through a conversation with a human"
kind: "package-reference"
---

# @deepseek-ai/dsh-authorization

English | [中文](README.zh.md)

## Overview

Authorization seam for plugin-owned flows that obtain a credential through a conversation with a human. This package is part of the Aeoth Desktop runtime and is consumed by the application-owned Host or renderer.

## Use this package

- **Scope:** `packages/credentials/authorization` owns this capability boundary.
- **Entry points:** runtime code is exported through `lib/index.js`; public types are exported through `lib/types/index.d.ts` when present.
- **Product boundary:** Electron Desktop is the product entry point; this page documents the package contract.

## Integration

- **Runtime peers:** declared in `package.json`.
- **Package family:** see the [parent package map](../README.md).
- **Lifecycle:** the consuming Desktop profile or Host/Client layer owns composition and cleanup.

## Source

- [`src/`](src/) — implementation and public source contracts.
- [`package.json`](package.json) — exports, dependencies and publication metadata.
- The full composition is built with `pnpm run build`.

## Desktop delivery

- This package is retained as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [`THIRD_PARTY_NOTICES.md`](../../../THIRD_PARTY_NOTICES.md).
