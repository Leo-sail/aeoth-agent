# @deepseek-ai/dsh-client-ui-settings-memory

Web/Desktop Plugins settings page for MEMORY, USER, source-session provenance, installed skill inspection, Curator review, and legacy-memory migration.

Memory writes use the active Remote provider and refresh the local snapshot after a successful commit. Curator candidates remain inactive until approval; the page exposes source-session links, revision metadata, active-file comparisons, explicit outcome feedback, and reversible archive/restore actions. Migration requires preview plus confirmation and exposes entry/skipped records before apply; rollback is guarded by the stored post-apply snapshot.

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
