---
description: "Web route-registration plugin: HTTP and upgrade routes, index transform taps, and static dist fallback; knows no harness concepts"
kind: "package-reference"
---

# @deepseek-ai/dsh-host-desktop-server

English | [中文](README.zh.md)

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.


Provide HTTP routes, upgrade handlers and index injections for the local Desktop Host. The Desktop composition controls the loopback listener; file serving is owned by desktop-static.

## Development

This package is developed with Aeoth Desktop. Follow the [source setup](../../../README.md#run-from-source) and [Desktop build instructions](../../../apps/desktop/README.md).

## Source

- [`src/index.ts`](src/index.ts): Service or plugin entry
- [`package.json`](package.json): exports and dependency declarations.

## Documentation

- [Package family](../README.md)
- [License and provenance](../../../THIRD_PARTY_NOTICES.md)
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
