# Aeoth Agent Python SDK

English | [中文](README.zh.md)

Python packages for driving Aeoth Agent as a subprocess. The client SDK communicates with the bundled runtime over newline-delimited JSON-RPC on stdio.

## Packages

| Directory | Dist / module | Role |
|---|---|---|
| [sdk](sdk/README.md) | `aeoth_agent` (legacy: `deepseek-harness-sdk` / `deepseek_harness`) | High-level turns API and lower-level JSON-RPC client |
| [sdk-runtime](sdk-runtime/README.md) | `aeoth` / `aeoth_agent_runtime` (legacy: `dsh` / `deepseek_harness_runtime`) | Bundled CLI executable and native sidecars |

## Behavior

The public import namespace is `aeoth_agent`; the inherited distribution and `deepseek_harness` import remain compatibility aliases.


The SDK starts the matching bundled `aeoth --profile sdk` runtime unless the caller selects another executable or profile. The `dsh` executable and namespace remain compatibility aliases. The runnable minimal example selects the shipped standalone `sdk-minimal` profile; the same runtime also packages `aeoth web` and its frontend assets for separate CLI use. Every launch requires an explicitly selected Aeoth home; Python never silently reads `~/.aeoth`. The [SDK reference](sdk/README.md) and [runtime carrier reference](sdk-runtime/README.md) own runtime selection, profiles, patches, and external plugin management.

## Contributor workflows

The [Python contributor workflows](development.md) cover building runtime artifacts, validating the packages, source-mode development, and distribution.
