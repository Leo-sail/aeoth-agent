# Aeoth Agent

English | [中文](README.zh.md)

Aeoth Agent is a desktop AI agent for local files, code and tools. The Electron application includes its Host, renderer, plugin composition and local workspace integration.

## Developer preview

Aeoth is a developer preview. Interfaces and compatibility may change.

- Product version: **0.1.0-preview.3**
- Source baseline: `dsh-v0.2.0-rc.2` at `639ed015397290b3745d163aafe02ffee4aa3f84`
- The repository contains the desktop application source and its runtime dependencies.
- This source distribution does not contain automated test suites, test fixtures, benchmark data, or user credentials.

<a id="run-from-source"></a>

## Run from source

Requirements: Node.js `^22.19.0` or `>=24.0.0`, pnpm `11.7.0`, and the native build prerequisites for your operating system.

```sh
pnpm install --frozen-lockfile
pnpm run build:official
pnpm run start:desktop
```

For an iterative desktop development session:

```sh
pnpm run dev:desktop
```

The application creates its own local home and profile on first launch. Configure the model endpoint and API key in **Settings → Models**. Do not commit credentials, session data, machine-specific configuration, `node_modules`, or build caches.

## Desktop distribution

The repository is prepared for a private desktop distribution. The local macOS Apple Silicon delivery directory is `release/0.1.0-preview.3/mac-arm64/`. DMG, ZIP and SHA-256 checksums are staged there after validation. The current preview lane is ad-hoc signed and is not a notarized public release.

The desktop package commands are maintained in [apps/desktop/README.md](apps/desktop/README.md). They cover runtime preparation, Electron packaging, macOS signing, Windows packaging, and update publication. Uploading is deliberately a separate, user-authorized step.

## Project layout

- `apps/desktop/` — Electron shell, native windows, update flow, and packaged resources.
- `apps/desktop-host/` — private Node host owned by the Electron application.
- `packages/desktop/` — Desktop runtime and renderer entry packages.
- `packages/bundle/desktop-app/` — Desktop profile composition.
- `packages/client/desktop/` — renderer boot kernel.
- `packages/host/desktop-server/` and `packages/host/desktop-static/` — local renderer transport and static asset serving.
- `migrations/` and runtime packages — durable application state and Agent capabilities.

## Privacy and provenance

No API key, user session, profile, upgrade backup, dependency directory, or local build cache belongs in the repository. Third-party package names, licenses, and provenance remain unchanged where compatibility requires them. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
