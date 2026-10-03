---
description: "Aeoth Agent Desktop runtime: profile composition and lifecycle for the Electron application"
kind: "package-reference"
---

# @deepseek-ai/dsh

English | [中文](README.zh.md)

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.


Load the application-owned Desktop profile and compose its bundle and patch layers. The private Host controls readiness, cancellation and shutdown; this package exposes no public executable.

## Development

This package is developed with Aeoth Desktop. Follow the [source setup](../../../README.md#run-from-source) and [Desktop build instructions](../../../apps/desktop/README.md).

## Source

- [`src/profile-boot.ts`](src/profile-boot.ts): Profile lifecycle
- [`package.json`](package.json): exports and dependency declarations.

## Documentation

- [Package family](../README.md)
- [License and provenance](../../../THIRD_PARTY_NOTICES.md)
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
