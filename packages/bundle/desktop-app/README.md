---
description: "the Aeoth runtime desktop application surface bundle: the web patch layer over dsh-base plus the runtime glue plugin (frontend dist serving, web-surface prompt, bash runtime variables, URL line)"
kind: "package-reference"
---

# @deepseek-ai/dsh-desktop-app

English | [中文](README.zh.md)

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.


Compose the Desktop Host services, renderer plugins and Agent presets on top of the base bundle. Electron owns startup; the bundle supplies local static resources and model-facing Desktop context.

## Development

This package is developed with Aeoth Desktop. Follow the [source setup](../../../README.md#run-from-source) and [Desktop build instructions](../../../apps/desktop/README.md).

## Source

- [`src/index.ts`](src/index.ts): Service or plugin entry
- [`cordis.patch.yml`](cordis.patch.yml): Composition
- [`package.json`](package.json): exports and dependency declarations.

## Documentation

- [Package family](../README.md)
- [License and provenance](../../../THIRD_PARTY_NOTICES.md)
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
