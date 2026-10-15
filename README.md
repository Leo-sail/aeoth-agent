# Aeoth Agent

English | [中文](README.zh.md)

Aeoth is a desktop AI agent built on top of [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness). It wraps the harness runtime into a standalone Electron application and ships everything as a single installable app for macOS.

The project is open source. Contributions, feedback, and bug reports are welcome via GitHub Issues and Discussions.

**Creator:** leochang — leochang210@gmail.com

---

## What it does

When you open Aeoth, you get a full dsh runtime running locally. The main thing it adds on top of plain dsh:

- **Desktop shell** — native window management, local profile isolation, and a tray icon. Nothing leaves your machine unless the model call does.

Everything else — the Agent execution engine, LLM routing, tool calling, session management, skills, MCP server support — is inherited directly from the dsh core. Aeoth does not replace or reinvent those layers.

---

## Quick start: install the app

Download the latest unsigned DMG for macOS Apple Silicon from the [Releases](https://github.com/Leo-sail/aeoth-agent/releases) page.

Because the build is ad-hoc signed and not notarized, macOS will refuse to open it the first time. To get past that:

1. Open the DMG and drag Aeoth to Applications as usual.
2. The first time you try to launch it, macOS shows "cannot be opened because the developer cannot be verified." Click **Cancel** — do not click Move to Trash.
3. Open **System Settings → Privacy & Security**, scroll to the bottom, and you'll see a message about Aeoth being blocked. Click **Open Anyway**.
4. A final dialog appears asking if you're sure. Click **Open**.

After that first launch, the app opens normally every time.

---

## First-time setup

On first launch, Aeoth creates a local profile under `~/.aeoth/`. Nothing is configured yet — you need to add a model before anything works.

1. Click the gear icon (Settings) in the bottom left.
2. Go to **Models** and add your API key for DeepSeek, OpenAI, Anthropic, or any provider you use.
3. Select a default model.
4. Close Settings. You're ready.

---

## Build from source

Requirements: Node.js `^22.19.0` or `>=24.0.0`, pnpm `11.7.0`, and Xcode Command Line Tools on macOS.

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run start:desktop
```

For iterative development with live reload:

```sh
pnpm run dev:desktop
```

To produce the macOS ARM64 unsigned DMG:

```sh
cp apps/desktop/.env.macos.example apps/desktop/.env.macos
pnpm run package:desktop:mac:arm64:unsigned
```

The output lands in `apps/desktop/.desktop-build/targets/mac-arm64/unsigned-artifacts/`.

---

## Project layout

```
apps/desktop/          Electron shell, native windows, update flow, packaged resources
apps/desktop-host/     Private Node host process owned by the Electron app
packages/desktop/      Desktop runtime and renderer entry packages
packages/bundle/       Desktop profile composition
packages/client/       Browser-side UI plugins (chat, workspace, settings, etc.)
packages/core/         Core services (session, storage, etc.)
packages/api/          Host-side Remote API controllers
packages/host/         Local transport and static asset serving
docs/                  Architecture and subsystem documentation
```

---

## Baseline and provenance

Aeoth is built on a fixed snapshot of dsh:

- **Baseline:** `dsh-v0.2.0-rc.2` at commit `639ed015397290b3745d163aafe02ffee4aa3f84`
- **Product version:** `0.1.0-preview.4`

This repository does not contain automated test suites, test fixtures, benchmark data, or user credentials from the upstream — those were removed as permitted by the upstream license before distribution.

Third-party package names, licenses, and attribution are preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

## Contributing

Bug reports and feature requests go in [GitHub Issues](https://github.com/Leo-sail/aeoth-agent/issues).

For code contributions, please read [CONTRIBUTING.md](CONTRIBUTING.md) first. The short version: one logical change per PR, Conventional Commits format, no secrets or machine-specific paths in commits.

---

## License

MIT — see [LICENSE](LICENSE).
