---
description: "Memory and skill management Remote namespace for Desktop runtime"
kind: "package-reference"
---

# @deepseek-ai/dsh-api-memory-controller

English | [中文](README.zh.md)

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.


Provide Desktop management operations for long-term memory, source records, skills, curator candidates and migration plans. Reads and writes go through the owning memory and skill services.

## Development

This package is developed with Aeoth Desktop. Follow the [source setup](../../../README.md#run-from-source) and [Desktop build instructions](../../../apps/desktop/README.md).

## Source

- [`src/index.ts`](src/index.ts): Service or plugin entry
- [`src/client/index.ts`](src/client/index.ts): Renderer entry
- [`src/types.ts`](src/types.ts): Public types
- [`package.json`](package.json): exports and dependency declarations.

## Documentation

- [Package family](../README.md)
- [License and provenance](../../../THIRD_PARTY_NOTICES.md)
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
