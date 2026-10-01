# @deepseek-ai/dsh-memory-mcp

这是将已配置 MCP 服务器接入太易 `MemoryProvider` 合同的适配器。`generic` 模式调用明确配置的读/写/搜工具；`reference-memory` 模式把有边界的 `MEMORY` / `USER` 条目写入 MCP 参考知识图谱的专用实体命名空间。基础 bundle 不会自动启用它，不能从工具描述中猜测提供方语义。

与 `@deepseek-ai/dsh-mcp-client`、`@deepseek-ai/dsh-mcp-resources` 一起挂载，并把 `memory.provider` 设置为适配器的 `providerName`。`apps/cli/config/examples/mcp-memory/mcp-reference-memory.cordis.yml` 是完整的可选接入示例。

模型仍然使用原有 `memory` 工具和 `/memory` 命令；条目容量、重复检查、凭据拒绝、来源追踪和提交边界由太易保留。外部服务器拥有自己的存储和可用性，失败不会静默回退到本地文件 Provider。
