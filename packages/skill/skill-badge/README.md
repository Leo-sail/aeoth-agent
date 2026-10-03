---
description: "Bundled dsh badge skill provider for Aeoth Agent"
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-badge

English | [中文](README.zh.md)

## Summary


## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.

## Use this package

Enable the plugin to make the `dsh-badge` skill available in the session skill catalog; the model can then load it like any other skill and follow its instructions for adding a "powered by Aeoth Agent" badge.

### When to choose it

Choose this provider when content produced with Aeoth Agent should carry official attribution badges, and the deployment wants the badge skill available to agents without storing it in a local skill directory. Skip it when the badge is irrelevant to the deployment — the plugin is disabled by default and adds nothing until enabled.

### Enable the plugin


```yaml
- name: '@deepseek-ai/dsh-skill-badge'
```

After enabling, `dsh-badge` appears in the available skills of the session catalog. The skill provides local Markdown markup and a packaged PNG badge asset; it does not assume a hosted image or project URL.

### What the badge skill provides

- **Markdown snippets.** Instructions for embedding the official badge markup in documents, PRs, and merge requests.
- **Packaged PNG asset.** A `dsh-badge.png` resource (726×120 source, rendered at 121×20) that works where remote images cannot be imported.

### Observable success and failures

Enabling the plugin makes `dsh-badge` appear in the catalog and loadable by name; disabling or omitting the row keeps it out of every catalog. Because the provider is immutable, discovery always succeeds with exactly one skill and never reports partial results.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

This section explains how the bundled provider is wired; the observable behavior is fully covered in [Use this package](#use-this-package).

### Design concept

The provider is an immutable, synchronously registered skill source: it registers one fixed candidate at the bundled skill rank (600) under the provider name `dsh-badge`, exposes its packaged `assets/` directory as the skill's directory resource base, and reads the skill body from the packaged `assets/dsh-badge.md` file on every load.

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Plugin entry and the immutable provider: one candidate, resource base, body load |
| — | No runtime invariant companion is published; the package owns one immutable provider registration, while the skill registry owns registration uniqueness and lifecycle checks. |
| [`assets/`](assets/) | Packaged skill body (`dsh-badge.md`) and PNG asset (`dsh-badge.png`) |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when the package-level contract is not enough. They move from the registry this provider registers on to how the skill reaches the model.

- [Skill subsystem reference](../../../docs/subsystems/skills.md) — the registry and provider contract this provider implements.
- [skill package](../skill/README.md) — the registry the provider registers on, and the shared rendering of loaded skills.
- [tool-skill package](../tool-skill/README.md) — how the badge skill reaches the session catalog and the model.

-----

<a id="model-experience"></a>
## Model Experience

Indirectly, through `dsh-tool-skill`, which renders the provider's catalog entry and the selected skill body to the model.

#### KV Cache effect

Disabled by default, the plugin changes no request. When enabled, its catalog entry and any loaded body change the provider KV prefix at their insertion points.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>


These limits define what the bundled provider does not do. They are current package constraints, not a task backlog.

- **One fixed skill, no runtime customization** — the provider contributes exactly the `dsh-badge` skill; deployments that need another badge variant author their own skill instead.
- **No hosted badge endpoint** — use the local Markdown image or the packaged PNG; add a public URL only when the user supplies and approves one.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
