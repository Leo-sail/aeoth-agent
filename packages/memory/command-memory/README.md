# @deepseek-ai/dsh-command-memory

Human-facing `/memory` command for managing the native profile-scoped `MEMORY` and `USER` stores without requiring a model call.

```text
/memory
/memory search <query>
/memory add memory <entry>
/memory add user <entry>
/memory replace memory <old text> => <new entry>
/memory remove user <old text>
```

The command uses the same `MemoryRuntime` contract as the model-facing `memory` tool and therefore exercises the same provider, capacity, validation, and atomic-write boundaries.

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
