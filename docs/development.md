# Development guide

English | [中文](development.zh.md)

This guide covers the public source distribution: prerequisites, installation, builds, and local application startup. Automated test suites, private CI gates, benchmark data, local agent instructions, and release credentials are intentionally not included.

## Prerequisites

- Node.js `^22.19.0` or `>=24.0.0`.
- pnpm `11.7.0` as declared by the root `package.json`.
- Git 2.26 or newer.
- Native build tools appropriate for the target operating system.

## Install

```sh
corepack enable
pnpm install --frozen-lockfile --ignore-scripts
```

The clean source tree does not run repository hooks or read a developer home. Application configuration, credentials, sessions, and generated artifacts belong outside the checkout.

## Build

```sh
pnpm run build:official
```

For individual surfaces:

```sh
pnpm run build:lib
pnpm run build:web
pnpm run build:desktop
```

Build outputs are ignored and must not be committed. The Web launcher and Desktop launcher use the `Aeoth` product namespace while preserving upstream package identities where compatibility requires them.

## Run

```sh
pnpm run start:web
pnpm run start:desktop
```

For source development with rebuild-on-change:

```sh
pnpm run dev:web
pnpm run dev:desktop
```

Use an explicit application home when validating a checkout. Do not point a source checkout at an existing personal profile or copy credentials into the repository.

## Package Desktop

```sh
pnpm run package:desktop:mac:arm64
pnpm run package:desktop:mac:x64
pnpm run package:desktop:win:x64
```

Signing, notarization, update-source configuration, and upload credentials are deployment-owned inputs. They are not supplied by this public source tree.

## Python packages

The Python SDK and runtime carrier live under `python/`. Build the JavaScript runtime first, then follow the package-specific README files for wheel staging. Python package metadata contains no repository-local credentials or user data.

## Source and provenance

Aeoth is based on `dsh-v0.2.0-rc.2` at commit `639ed015397290b3745d163aafe02ffee4aa3f84`; the product release record is in [`aeoth-release.json`](../aeoth-release.json). Preserve [`LICENSE`](../LICENSE) and [`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md) when redistributing the source.
