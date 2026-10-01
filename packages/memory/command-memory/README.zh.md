# @deepseek-ai/dsh-command-memory

提供不经过模型调用的 `/memory` 人工命令，用于管理当前 profile 的 `MEMORY` / `USER` 记忆。

```text
/memory
/memory search <query>
/memory add memory <entry>
/memory add user <entry>
/memory replace memory <old text> => <new entry>
/memory remove user <old text>
```

命令与模型工具共用 `MemoryRuntime`，因此使用同一套 Provider、容量、校验和原子写入边界。

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
