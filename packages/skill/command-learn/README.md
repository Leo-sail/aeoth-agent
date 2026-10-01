# @deepseek-ai/dsh-command-learn

Human-facing `/learn` command for the experience-to-skill loop.

`/learn <source, URL, path, or procedure>` queues an explicit model step that searches existing skills, inspects the source, creates or updates a reusable `SKILL.md`, and verifies the result. The command does not silently write files itself; the next agent step performs the source inspection and file mutation through the normal tool authorization path.

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
