# @deepseek-ai/dsh-api-memory-controller

为 Web/Desktop 提供 `memory` Remote 命名空间，管理 profile 隔离的 MEMORY/USER 条目和技能摘要。

记忆条目会返回来源会话信息，用于与历史会话关联。写入仍经过 MemoryRuntime 的校验和 Provider 边界。

提供 `memory` 命名空间的记忆读写/搜索、来源会话解析、技能读写、Curator 审阅与反馈、迁移预览/列表/应用/回滚。候选保留来源证据、加载版本和当前文件内容，供设置页比较。

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
