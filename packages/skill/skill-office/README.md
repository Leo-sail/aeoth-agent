---
description: "Bundled Word, PowerPoint, and Excel workflows and structural checks"
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-office

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

Mount this provider beside the skill registry and `dsh-tool-skill` to expose `office-docx`, `office-pptx`, and `office-xlsx` in the session catalog. The provider supplies instructions and scripts; the deployment supplies its interpreters, authoring libraries, execution tools, and file delivery tool.

### Minimal configuration

```yaml
- name: '@deepseek-ai/dsh-skill-office'
```

| Field | Default | Meaning |
|---|---|---|
| `assetRoot` | Packaged `assets/` | Absolute resource directory containing the three skill folders and shared `scripts/`; deployments can place it outside an application archive. |
| `node` | Current standalone Node process | Absolute Node executable; Electron and SDK executables must supply a standalone Node. |

Relative paths, missing resources, and skill files without a YAML frontmatter description reject activation. Disposing the plugin removes its candidates. Project and user skill precedence remains owned by the skill registry.


### Structural checks

The shared Python checker reads DOCX, PPTX, or XLSX without modifying the source. It recognizes Transitional and Strict OOXML namespaces, validates ZIP/XML and internal package relationships, reports document structure, and optionally checks required text or slide/sheet count. DOCX text assertions cover the main body, section-referenced headers and footers, and body-referenced footnotes and endnotes; comments, glossary text, and unreferenced parts or notes do not satisfy them. It uses only the Python standard library. Invalid packages, corrupt or encrypted ZIP members, and report-file write failures produce a JSON failure report on stdout. A passing report does not establish appearance, feature preservation, or calculated formula results.

Excel data and formula tasks skip visual inspection; formatting, layout, chart appearance, printing, or known display problems require checking relevant regions. Basic styling does not itself trigger inspection, and formula recalculation and requested exports remain independent operations. Blank or transparent previews do not pass visual inspection. A failed preview ends visual checking without diagnostic workbooks, PDF conversion, or unrequested print-setting changes; the usable workbook is delivered with the inspection limitation.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The provider registers three bundled candidates and reads their descriptions from the shipped YAML frontmatter at activation. Loaded instruction bodies exclude that metadata. Each loaded skill exposes its own filesystem directory, so the execution tool can resolve the shared checker without relying on the task working directory. Configurable external resources support carriers whose application archive is not readable by Python.

| File | Responsibility |
|---|---|
| [`src/index.ts`](src/index.ts) | Provider registration and configured resource paths. |
| [`assets/`](assets/) | Three workflows and the read-only OOXML checker. |
| — | No runtime invariant companion is published: the provider owns immutable candidates, and the skill registry owns registration lifecycle and precedence. |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Skill registry](../skill/README.md) — discovery and precedence.
- [Skill tool](../tool-skill/README.md) — model-visible catalogs and bodies.
- [File delivery](../../deliverables/tool-present/README.md) — current source-path delivery.

-----

<a id="model-experience"></a>
## Model Experience

Indirectly, through `dsh-tool-skill`, which renders the catalog entries and selected instruction body.

#### KV Cache effect

Mounting the provider adds three catalog entries; loading a skill adds its body at the existing skill-tool insertion point. The provider does not add separate prompt sections.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- The provider depends on LibreOffice Kit but does not install Python or authoring libraries. The checker requires Python 3.9 or later.
- Structural checks do not judge pagination, clipping, fonts, chart appearance, or Excel recalculation.
- The checker accepts DOCX, PPTX, and XLSX only; legacy, encrypted, and macro-enabled formats require an appropriate separate workflow.

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
