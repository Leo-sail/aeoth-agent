---
description: "Native A2A HTTP adapter for Aeoth Agent Link"
kind: "package-reference"
---

# @deepseek-ai/dsh-api-agent-link

English | [中文](README.zh.md)

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.


Adapt the Agent Link service to HTTP routes for Agent Cards and A2A requests. The adapter uses the Desktop Host route registry; it does not start a separate server.

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
