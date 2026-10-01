# @deepseek-ai/dsh-memory-migration

为旧 MCP 记忆导出提供预览、指纹校验、确认写入和可回滚迁移。支持常见 JSON/JSONL、图实体、Markdown 条目、`§` 分隔文件和普通行；非文本值会进入 skipped 列表，结构损坏、数组类型错误或 Aeoth 观察值无效会在预览阶段拒绝，绝不写入。

用户必须先在设置页预览再应用。应用前会重新计算源文件指纹；记忆在应用后被其他操作改变时，自动回滚会拒绝覆盖。迁移计划和前后快照保存在当前 profile 的 `memories/migrations/plans/`，使用 owner-only 权限。

该包不增加模型工具；只有显式应用后，`/memory` 和模型 `memory` 工具才能看到导入条目。源文件必须是 8 MiB 以内的普通文件，不跟随符号链接。
