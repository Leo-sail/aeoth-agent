# @deepseek-ai/dsh-memory-filesystem

Aeoth 原生 `MEMORY.md` / `USER.md` provider。

默认写入当前 profile 的 `memories/` 目录，文件权限为 owner-only：

```text
$AEOTH_HOME/profiles/<profile>/memories/MEMORY.md
$AEOTH_HOME/profiles/<profile>/memories/USER.md
```

每个文件用 `§` 分隔完整条目；空文件表示空记忆。写入使用原子替换与 owner-only 目录/文件权限。该 provider 只负责介质读写，不负责决定记忆内容或模型行为。

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
