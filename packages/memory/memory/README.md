# @deepseek-ai/dsh-memory

Aeoth 原生长期记忆服务。它定义两个 profile-scoped、边界明确的记忆目标：

- `memory`：助手的环境事实、项目约定和可复用经验；
- `user`：用户偏好、沟通方式和稳定用户档案。

存储介质由 `MemoryProvider` 插件负责。服务负责完整条目替换、容量限制、重复检查、敏感/不可见控制字符拒绝、搜索回退和变更提交边界。默认 provider 名称为 `filesystem`，但本包不绑定文件系统或外部云服务。

## Provider contract

Provider 必须实现 `load(target)` 和 `save(document)`，可选实现 provider-native `search()` 与 `close()`。外部长期记忆服务（例如远程向量/画像系统）应作为独立插件注册 provider，再通过 profile 配置选择，不应复制或修改 `MemoryRuntime` 的工具合同。

记忆数据按 profile 隔离；provider 写入成功前不发布新快照或 `memories/change`。`renderPrompt()` 明确将记忆标识为数据而非指令，调用方仍需避免把未经核实的内容当作事实。

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
