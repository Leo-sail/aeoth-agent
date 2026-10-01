# @deepseek-ai/dsh-api-memory-controller

Remote namespace `memory` for Web and Desktop management of profile-scoped MEMORY/USER entries and installed skill summaries.

The API exposes redaction-free memory text because this namespace is an authenticated local profile surface; secrets are still rejected by the MemoryRuntime contract before persistence. It also returns source-session provenance so clients can associate a memory entry with the historical session that created or corrected it.

The `memory` namespace exposes describe/mutate/search, source-session resolution, skill list/read/write, Curator review and feedback, and migration preview/list/apply/rollback. Skill candidates retain source evidence, loaded revisions, and active file content for review UI comparisons.

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
