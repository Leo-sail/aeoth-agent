---
description: "Native Bot Mode and Agent Community Web/Desktop surface"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-agent-community

[English](README.md) | 中文

本包属于太易桌面运行时。Electron 与应用拥有的 Host 是产品入口，本 README 记录包契约。

在左侧导航注册两个并列入口：「Agent」只展示持久 Agent 列表与直聊；「协作团队」只展示 Agent 群聊。两个入口共用同一页面组件，由 `mode` 区分数据域、创建/编辑表单和输入框的 @ 建议。Agent 表单中的模型列表按厂商分组，直接来自 Host 模型目录（即「设置 → 模型」中已配置的可用模型）。消息与运行操作通过 Community Remote 提交，输入区域复用共享编辑器。

Agent 行的删除按钮在确认后永久删除 Agent；会话头部的「清空对话」只清空直聊消息与会话上下文，保留 Agent；群聊行的删除按钮删除群聊。回复失败时在消息下方显示原因，缺少 API Key 时提示先到「设置 → 模型」配置再重试；群聊消息没有指派给任何 Agent 时提示使用 @；群聊暂停时在输入框上方显示提示条和「继续」按钮。

## 开发

本包随太易桌面端开发。环境准备见[源码运行](../../../README.zh.md#run-from-source)，打包方式见[Desktop 开发说明](../../../apps/desktop/README.zh.md)。

## 源码

- [`src/index.ts`](src/index.ts)：服务或插件入口
- [`src/client/index.ts`](src/client/index.ts)：渲染器入口
- [`package.json`](package.json)：导出与依赖声明。

## 文档

- [包分组](../README.zh.md)
- [许可证与来源](../../../THIRD_PARTY_NOTICES.md)
## Desktop 交付

- 本包只作为太易桌面端的源码和运行时闭包保留。
- 本包不负责独立产品入口或安装包。

## 许可证

本包遵循仓库许可证；第三方依赖和来源记录见 [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md)。
