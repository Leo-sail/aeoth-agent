---
description: "Host half of open-in-app: resolved application catalog, icons, and the launch endpoint as three webServer routes"
kind: "package-reference"
---

# @deepseek-ai/dsh-host-open-in-app

English | [中文](README.zh.md)

## Summary

Use `dsh-host-open-in-app` with its [browser companion](../../client/ui-open-in-app/README.md) to let users open a workspace directory in an installed editor, Git GUI, terminal, or file manager. It offers a fixed application catalog and shows only entries that the host can verify; newly installed applications appear after restart, while missing launchers are removed when detected. Requests require the deployment's browser authentication and host-origin trust checks. Detection and launch commands use configurable deadlines and do not pass inherited credentials to launched applications.

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Mount the package in a composition that carries `webServer`, `connection`, and `subprocess`, normally beside its browser surface [`dsh-client-ui-open-in-app`](../../client/ui-open-in-app/README.md); the pair puts an "Open In..." split button in the Web Session header whenever the host resolved at least one installed catalog application.

### When to choose it

Choose it for a Web deployment whose users work beside a local editor, Git GUI, terminal, or file manager and want the workspace directory opened there in one click. Avoid it for opening one path with the OS-default application from host code — that is `dsh-apiproxy`'s `openPath`; this package's subject is *which* application, with per-application resolution and launchers.

### Minimal configuration

```yaml
- name: '@deepseek-ai/dsh-host-open-in-app'
  config:
    probeTimeoutMs: 10000
    iconTimeoutMs: 10000
    launchWatchMs: 1000
```

| Field | Default | Meaning |
|---|---|---|
| `probeTimeoutMs` | required | Per-command deadline in milliseconds for catalog-resolution host commands (`xcode-select`, the Windows registry reads). |
| `iconTimeoutMs` | required | Per-command deadline in milliseconds for icon-extraction host commands (`plutil`/`sips` on macOS, the PowerShell extraction on Windows). |
| `launchWatchMs` | required | Early-failure watch window per launch: a launcher still running when the window closes counts as launched and keeps running, so this bounds how long the open route holds a successful launch. |

The three deadlines are independent so tuning one operation never changes another's response time; timeouts are failure bounds, not latency budgets, so the conservative resolution/icon values cost nothing when commands are healthy. The generated configuration catalog is the exhaustive source for every accepted field.

### The catalog and how it resolves

The catalog is a fixed whitelist covering editors and IDEs (Cursor, VS Code and Insiders, Windsurf, Zed, Sublime Text, Xcode, Android Studio, and the JetBrains IDEs IntelliJ IDEA, PyCharm, WebStorm, PhpStorm, GoLand, Rider, RustRover), Git GUIs (Fork, Sourcetree, GitHub Desktop, Tower, GitKraken, SmartGit, Sublime Merge), terminals (Ghostty, Warp, iTerm2, kitty, Terminal, Windows Terminal, Git Bash, GNOME Terminal, Konsole), and per-platform file managers (Finder, File Explorer, `xdg-open`). Each entry declares per-platform launcher sources tried in order, and every source yields a **verified launcher** — an artifact this host actually holds — never a bare install record:

- **macOS** checks the known application directories (`/Applications`, `~/Applications`) for the entry's bundle spellings and launches `open -a <resolved bundle>`; Xcode follows `xcode-select -p`, so Beta or renamed installs are found. No Launch Services query and no disk scan runs.

### What to expect

When the inherited process layer of the [launch environment](../../util/launch-environment/README.md) contains a non-empty `SSH_CONNECTION` or `SSH_TTY`, the application list is empty and the Web header hides Open In, including any remembered choice. Project and user `.env` values do not establish an SSH launch. The host skips application probing and refuses icon and launch requests for unavailable applications. This rule also applies when an SSH session carries a display or VS Code IPC connection; it does not identify remote deployments whose launchers remove both SSH markers.

Resolution runs lazily, once per host process, on the first request that needs it; installing an application takes effect on the next restart, while an uninstalled one heals immediately — a launch that finds its executable gone re-resolves that one entry and drops it from the list when nothing proves it anymore. The icon route serves the real application icon on every platform where one is extractable: the bundle's `.icns` as a 128px PNG on macOS, the executable's associated icon as a 32px PNG on Windows, and the desktop entry's hicolor-theme icon (PNG or SVG) on Linux; a missing icon answers 404 and the browser surface renders a generic glyph.

### The `./shared` subpath

The route paths and wire payload types are published as the browser-safe `./shared` subpath (constants and types only, no runtime identity); the browser package inlines it into its client bundle. A route or payload change lands in `src/shared.ts` and both packages pick it up from there.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

Linux desktop-entry fields and icons use the shared [native-command](../../util/native-command/README.md) helpers. Directory launchers come from this package’s installed application catalog; file handlers come from the operating system’s associations.

<details>
<summary>Implementation internals — click to expand</summary>


[`src/index.ts`](src/index.ts) registers the three routes on `ctx.webServer`: `GET /open-in-app/apps` (the resolution map's keys), `GET /open-in-app/icon/<id>` (the extracted icon, cached in memory per process), and `POST /open-in-app/open` (launches the map's verified launcher directly — never a re-detection). Every route asks the composition's `connection` service for a rejection first; the complete trust story — the Host/Origin fence and browser authentication — has one home in the [`src/index.ts`](src/index.ts) module comment. On top of that fence the open route validates its body at the wire: an `application/json` media type, a 64 KiB ceiling, a resolved-available catalog id, and an absolute path naming an existing directory. Resolution and icon commands run through [`@deepseek-ai/dsh-native-command`](../../util/native-command/README.md) (argv, never a shell) under their respective deadlines; PATH names go through `ctx.subprocess.resolveExecutable()` in-process.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [dsh-client-ui-open-in-app](../../client/ui-open-in-app/README.md) — the browser split button consuming these routes.
- [dsh-subprocess](../../subprocess/subprocess/README.md) — the capability providing in-process PATH resolution and the scrubbed child environment.
- [dsh-native-command](../../util/native-command/README.md) — the no-shell host command runner for resolution and icon commands.
- dsh-host-webserver — the route registry carrying the three HTTP endpoints.
- [Host package map](../README.md) — the GUI-host family this package belongs to.

-----

<a id="model-experience"></a>
## Model Experience

None, as this package opens host applications for a human and touches no prompt, message, schema, stream, or tool result.

#### KV Cache effect

None; the package never assembles or sends provider requests.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **The catalog is fixed at build time.** A deployment cannot add its own editor or Git GUI from cordis.yml; extending the list means extending `OPEN_IN_APP_CATALOG` and the browser package's dictionaries together. The operating system can locate known applications but cannot establish that every installed application accepts a workspace directory or which launch protocol it requires, so the package does not enumerate an unrestricted OS application list. Configurable custom handlers remain deferred; their user-supplied labels are user data rather than locale-owned product copy.
- **macOS detection is known-paths only.** A bundle renamed beyond the catalog's spellings or moved outside `/Applications` and `~/Applications` is not detected; there is no Launch Services query (a native LaunchServices/NSWorkspace lookup needs an addon the repository does not carry) and deliberately no disk scan.
- **New installs appear after a restart.** Resolution runs once per host process; only the uninstall direction self-heals (a missing launcher re-resolves its one entry on the spot).

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

The promotion decisions — the host/`ui-` package split, why raw webServer routes instead of a Typert Remote, why the catalog stays compile-time fixed, the resolver redesign (verified launchers, one resolution pass, no per-click re-detection), the three-deadline configuration, and the per-platform icon strategies with their rejected alternatives — are recorded in the promotion Agent Note.

</details>

**Runtime invariant:** No companion is published. The package serves one host resolution pass over three stateless routes; the route registrations prove disposal through their HMR-safety specs, and no independent observations can diverge.
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
