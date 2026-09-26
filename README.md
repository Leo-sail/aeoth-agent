# Aeoth Agent

[中文](README.zh.md)

Aeoth Agent is a local AI agent application for working with files, code and tools through desktop and Web interfaces.

## Current distribution

- Product version: **0.1.0-preview.3**.
- Upstream baseline: `dsh-v0.1.7-rc.2`, commit `477b4f420553e8a52c2fbccc464d7561b239c443`.
- Desktop onboarding works without account sign-in. Configure your own model endpoint and API key in Settings → Models.
- Account sign-in and Contact us are temporarily disabled. Creator mode uses the Aeoth product name.
- This source distribution intentionally excludes all automated tests, fixtures, recordings and benchmarks. Build and runtime code, migrations, packaged skills, native resources and licenses are retained.

## Install from this repository

Requirements: Node.js `^22.19.0` or `>=24.0.0`, pnpm as pinned by `package.json`, and the native build prerequisites for your operating system.

```sh
pnpm install --frozen-lockfile
pnpm run build:official
pnpm run start:web
```

Use the authenticated local URL printed by the launcher. Do not expose that URL or its token publicly. Configuration, model credentials and session data are created on first use; no personal profile is supplied with this repository.

For desktop source development and packaging, see [apps/desktop/README.md](apps/desktop/README.md). Copy environment examples only when needed, supply your own release configuration, and never commit actual environment files or signing credentials.

## Desktop distribution

The macOS Apple Silicon installer is an ad-hoc local preview, not a notarized public release. Binary installers and local build archives are intentionally excluded from this clean source tree; generate them from the pinned source in a private release workflow after repository authorization.

## Privacy and provenance

No model keys, user sessions, machine-specific configuration, upgrade backups or development caches belong in this source tree. Keep personal data in the application home, outside the repository. Old release directories are not part of this distribution.

Aeoth preserves the real upstream package/protocol identities where compatibility requires them. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party attribution and licensing. A private repository does not remove these obligations.
