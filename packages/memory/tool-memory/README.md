# @deepseek-ai/dsh-tool-memory

将 Aeoth 原生 `MEMORY` / `USER` 长期记忆暴露为模型工具 `memory`。

支持：

- `read`：读取一个目标的当前条目；
- `search`：搜索一个目标的条目；
- `add`：添加完整条目并拒绝精确重复；
- `replace`：用 `old_text` 唯一定位后替换完整条目；
- `remove`：用 `old_text` 唯一定位后移除条目。

`memory` / `user` 的职责分离和容量默认值参考 Hermes，但实现是 Aeoth 自有合同。外部 provider 通过 `@deepseek-ai/dsh-memory` 注册，不改变模型工具名称。

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
