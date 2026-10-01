# @deepseek-ai/dsh-client-ui-settings-memory

Web/Desktop 插件设置页，提供 MEMORY、USER、来源会话关联、技能查看与 Curator 审阅、旧记忆迁移。

记忆写入走当前 Remote Provider，提交成功后刷新本地快照。Curator 候选在批准前保持未激活；设置页提供来源会话入口、版本信息、当前文件对比、明确结果反馈以及可恢复的归档/恢复。迁移必须先预览并确认，应用前展示条目和 skipped 记录；回滚受应用后快照保护。

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
