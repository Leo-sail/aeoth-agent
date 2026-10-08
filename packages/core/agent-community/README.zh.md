---
description: "Native Bot Mode community, durable rooms, bot runs, and live control"
kind: "package-reference"
---

# @deepseek-ai/dsh-agent-community

[English](README.md) | 中文

本包属于太易桌面运行时。Electron 与应用拥有的 Host 是产品入口，本 README 记录包契约。

管理持久 Bot 身份、房间成员、消息顺序、邮箱和运行状态。房间状态与执行一次运行的临时 Agent 句柄分开保存。

删除 Agent（`deleteBot`）会移除它的直聊、它在所有房间中的运行、邮箱和隐藏 Session（包括 Session 日志与投影缓存），并把它移出群聊；成员少于 2 个的群聊一并删除。新建 Agent 不带凭据命名空间，模型调用使用「设置 → 模型」中配置的部署凭据；早期版本隐式写入、等于 Agent 名称或 id 的命名空间在读取时去除，显式指定的命名空间仍然隔离且不回退到全局凭据。Agent 在回复中 @user 会暂停群聊接力，用户的下一条消息会自动恢复该群聊；手动暂停保持有效。重试次数耗尽的运行结算为失败，不再阻塞同一房间或同一 Agent 的后续运行。

## 开发

本包随太易桌面端开发。环境准备见[源码运行](../../../README.zh.md#run-from-source)，打包方式见[Desktop 开发说明](../../../apps/desktop/README.zh.md)。

## 源码

- [`src/index.ts`](src/index.ts)：服务或插件入口
- [`src/types.ts`](src/types.ts)：公共类型
- [`package.json`](package.json)：导出与依赖声明。

## 文档

- [包分组](../README.zh.md)
- [子系统架构](../../../docs/subsystems/core.zh.md)
- [许可证与来源](../../../THIRD_PARTY_NOTICES.md)
## Desktop 交付

- 本包只作为太易桌面端的源码和运行时闭包保留。
- 本包不负责独立产品入口或安装包。

## 许可证

本包遵循仓库许可证；第三方依赖和来源记录见 [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md)。
