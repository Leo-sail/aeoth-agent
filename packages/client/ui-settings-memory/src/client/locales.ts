export const en = {
  title: 'Memory & Skills', description: 'Review durable facts, correct your profile, and manage learned skills.',
  memory: 'MEMORY', user: 'USER', skills: 'Skills', review: 'Review', migration: 'Migrate legacy memory', provider: 'Storage provider', loading: 'Loading…',
  memoryHint: 'Environment, project conventions, and verified lessons. Do not store credentials.',
  userHint: 'Stable preferences and communication expectations. Do not store sensitive guesses.',
  skillsHint: 'Profile-owned skills are editable. Bundled and third-party skills are read-only. /learn queues a learning request; it does not guarantee a verified skill.',
  empty: 'No entries yet.', add: 'Add entry', entry: 'Memory entry', edit: 'Edit', save: 'Save', cancel: 'Cancel', remove: 'Delete', confirmDelete: 'Confirm deletion',
  addPlaceholder: 'Write a durable, non-secret fact…', search: 'Search', searchPlaceholder: 'Search this memory store', clear: 'Clear search', export: 'Export JSON',
  capacity: '{used} / {limit} characters', noSource: 'Manually added · no source session', source: 'Source session', event: 'Event {seq}',
  resolving: 'Resolving source…', unavailable: 'Source could not be read. Refresh to retry.', missing: 'Source session is no longer available.', eventMissing: 'The source event is unavailable; the session can still be opened.',
  mismatch: 'Source workspace does not match; preview is hidden.', live: 'Live', persisted: 'Saved',
  newSkill: 'New skill', skillName: 'Skill name', skillDescription: 'Description', skillContent: 'Instructions',
  skillPlaceholder: 'Choose a skill to inspect it, or create a profile-owned skill.', reviewHint: 'Model-generated skills remain inactive until you approve them. Loading instructions records usage, not success. Outcomes require explicit evidence or user feedback; review actions are reversible.', evidence: 'Evidence', reviewNote: 'Reviewer note (optional)', approve: 'Approve', reject: 'Reject', archive: 'Archive', restore: 'Restore', success: 'Mark success', failure: 'Mark failure', feedbackSummary: '{uses} uses · {successes} success · {failures} failure', workspace: 'Workspace', revision: 'Revision', baseRevision: 'Base revision', activeRevision: 'Active revision', proposedVersion: 'Proposed instructions', activeVersion: 'Active file', openSource: 'Open source session', migrationHint: 'Preview a legacy MCP memory export before applying it. The source is fingerprinted and automatic rollback refuses if memory changed afterwards.', migrationPath: 'Absolute path to legacy memory export', preview: 'Preview', apply: 'Apply', rollback: 'Roll back', confirmApply: 'Apply this migration to MEMORY and USER?', confirmRollback: 'Restore MEMORY and USER to the pre-migration state?', migrationEntries: '{count} entries · {skipped} skipped', migrationSkipped: 'Skipped', readonly: 'Read-only provider skill', owned: 'Editable profile skill', skillSearch: 'Filter skills',
} as const
export type MemorySettingsLocaleKey = keyof typeof en
export const zh: Record<MemorySettingsLocaleKey, string> = {
  title: '记忆与技能', description: '查看长期知识、纠正用户档案，管理已学习的技能。',
  memory: 'MEMORY', user: 'USER', skills: '技能', review: '审阅', migration: '迁移旧记忆', provider: '存储 Provider', loading: '加载中…',
  memoryHint: '保存环境约定、项目事实和已验证经验。不要存储凭据。', userHint: '保存稳定偏好和沟通习惯。不要记录敏感推断。',
  skillsHint: '可编辑当前 profile 的技能；内置及第三方技能只读。/learn 仅提交学习请求，不代表技能已生成或验证。',
  empty: '暂无条目。', add: '添加条目', entry: '记忆内容', edit: '编辑', save: '保存', cancel: '取消', remove: '删除', confirmDelete: '确认删除',
  addPlaceholder: '写下一条有长期价值、不含凭据的事实…', search: '搜索', searchPlaceholder: '搜索当前记忆', clear: '清除搜索', export: '导出 JSON',
  capacity: '{used} / {limit} 字符', noSource: '手动添加 · 无来源会话', source: '来源会话', event: '事件 {seq}',
  resolving: '解析来源中…', unavailable: '来源暂时无法读取，可刷新重试。', missing: '来源会话已不可用。', eventMissing: '来源事件不可用，仍可打开会话。',
  mismatch: '来源工作区不匹配，已隐藏预览。', live: '实时', persisted: '已保存',
  newSkill: '新建技能', skillName: '技能名称', skillDescription: '描述', skillContent: '技能指令',
  skillPlaceholder: '选择一个技能查看，或创建当前 profile 的技能。', reviewHint: '模型生成的技能在用户批准前不会启用。加载指令只记录使用，不推断成功；结果须由明确证据或用户反馈确认，审阅操作可恢复。', evidence: '依据', reviewNote: '审阅备注（可选）', approve: '批准', reject: '拒绝', archive: '归档', restore: '恢复', success: '标记成功', failure: '标记失败', feedbackSummary: '{uses} 次使用 · {successes} 成功 · {failures} 失败', workspace: '工作区', revision: '版本', baseRevision: '基线版本', activeRevision: '当前版本', proposedVersion: '候选指令', activeVersion: '当前文件', openSource: '打开来源会话', migrationHint: '先预览旧 MCP 记忆导出，再确认写入。源文件会做指纹校验；记忆发生其他变化时不会自动回滚。', migrationPath: '旧记忆导出的绝对路径', preview: '预览', apply: '应用', rollback: '回滚', confirmApply: '确认将迁移写入 MEMORY 和 USER？', confirmRollback: '确认将 MEMORY 和 USER 恢复到迁移前状态？', migrationEntries: '{count} 条 · 跳过 {skipped} 条', migrationSkipped: '跳过', readonly: '只读 Provider 技能', owned: '可编辑的 profile 技能', skillSearch: '筛选技能',
}
