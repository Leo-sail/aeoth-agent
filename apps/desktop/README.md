# Aeoth Agent Desktop

English | [中文](README.zh.md)

Aeoth Desktop is the product entry point. Electron owns the windows, private Host, local profile, workspaces and application lifecycle.

## Developer preview

The product version is **0.1.0-preview.4**. Model endpoints and API keys are configured in the application. A local preview does not require a product account.

## Development

Run these commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run start:desktop
```

Use `pnpm run dev:desktop` for incremental development. The launcher owns a separate development profile and Electron data directory. Do not use a real user profile for verification.

## Package for macOS

Copy `apps/desktop/.env.macos.example` to `apps/desktop/.env.macos`. Leave signing and upload credentials empty for the unsigned preview, then run:

```sh
pnpm run package:desktop:mac:arm64:unsigned
```

The package command builds the application, prepares the production dependency set and verifies the final ASAR inventory. Node, CPython and Python wheels are pinned by `scripts/primary-runtime/lock.json`; Electron is checked against its locked npm package checksums. Cached files must pass the same checks as downloaded files.

Build outputs go to `.desktop-build/targets/mac-arm64/unsigned-artifacts/` inside this directory. After archive and isolated-startup validation, stage the DMG, ZIP and checksum list under `dist/<version>/mac-arm64/` at the repository root. Runtime execution checks use temporary directories and are not retained as a test suite.

## Runtime

The application includes its private Host, renderer, production Node dependencies, primary interpreters and Office resources. Electron manages the Desktop profile and bridges authenticated calls to the loopback Host. The local service is not a public deployment endpoint.

## Release boundary

- Preview artifacts use ad-hoc signatures, not Developer ID signing or Apple notarization.
- Signed builds require separate credentials. Never commit keys, certificates, profiles or local environment files.
- Packaging does not authorize an upload. Repository push and installer publication remain separate operations requiring user confirmation.

## License

See the repository [license](../../LICENSE) and [third-party notices](../../THIRD_PARTY_NOTICES.md).
