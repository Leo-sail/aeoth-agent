---
description: "Native bidirectional A2A client, task registry, and Agent Card contract"
kind: "package-reference"
---

# @deepseek-ai/dsh-agent-link

English | [中文](README.zh.md)

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.


Provide Agent Card discovery, outbound A2A requests and a task registry. The core service owns task state; the HTTP adapter owns transport.

## Development

This package is developed with Aeoth Desktop. Follow the [source setup](../../../README.md#run-from-source) and [Desktop build instructions](../../../apps/desktop/README.md).

## Source

- [`src/index.ts`](src/index.ts): Service or plugin entry
- [`src/types.ts`](src/types.ts): Public types
- [`package.json`](package.json): exports and dependency declarations.

## Documentation

- [Package family](../README.md)
- [Subsystem architecture](../../../docs/subsystems/core.md)
- [License and provenance](../../../THIRD_PARTY_NOTICES.md)
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
