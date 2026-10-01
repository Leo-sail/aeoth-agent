---
description: "Durable, user-gated skill proposals with review, activation, archive, restore, and evidence-backed usage feedback."
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-curator

English | [中文](README.zh.md)

## Summary

The Curator keeps model-generated skill proposals inactive until a user approves them. It persists proposals and usage feedback in the profile-owned skill root, writes approved `SKILL.md` files atomically, archives by removing only the managed active file, and restores from the durable candidate content. Every proposal records optional session/workspace evidence and the management page can open the source session. Actual `skill` loads record a revision-bound usage event; success or failure is recorded only from explicit outcome evidence or user feedback.

## Use this package

The base bundle mounts the Curator alongside the profile-owned skill filesystem provider. `/learn` asks the model to inspect a source and call `skill_propose`; the proposal appears in the Memory & Skills management page. Approve, reject, archive, or restore it there. A proposal is never activated merely because the model produced it.

The Curator rejects invalid names, control characters, likely credentials, oversized content, symlinked skill paths, and invalid review transitions. Feedback is append-only, deduplicated by session event and revision, and can be supplied by actual tool-result observation or explicit user review. Approved and archived candidates expose the active file content and revisions for comparison before another review action.

## Model Experience

The model sees `skill_propose`, not a direct file-write capability. The tool result returns only the proposal id, name, and pending status. The `skill` loader catalog includes a skill only after the profile skill provider sees an approved file.

### Token and KV-cache effects

Proposal content is not injected into the model prompt after submission. Skill catalogs contain bounded descriptions; full instructions enter the prompt only when the model loads an approved skill through the existing `skill` tool.

## Known Limitations and Deferred Work

- Usage records prove that a specific revision was loaded, not that every downstream task result was correct; users can add explicit outcome feedback from the management page.
- A later proposal for the same name can replace an approved file only after another explicit approval.
- Cross-profile skill sharing and remote skill marketplaces are outside this package.

## Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Proposal state, review state machine, managed file writes, feedback, and `skill_propose` |
| [`../tool-skill/src/index.ts`](../tool-skill/src/index.ts) | Actual skill tool-result feedback observation |
