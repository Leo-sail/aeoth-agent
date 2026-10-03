---
description: "太易桌面端包工作区"
kind: "package-group"
---

# 太易（Aeoth Agent）运行时包

[English](README.md) | 中文

## 概述

这些包组成太易桌面运行时。应用 README 是产品入口，本页是源码地图。

## 包分组

- [`api`](api/README.zh.md) — 供桌面渲染器调用的类型化 Host 操作。
- [`attachment`](attachment/README.zh.md) — 附件身份与本地内容存储。
- [`boot`](boot/README.zh.md) — Profile 加载、配置变更与插件生命周期。
- [`browser-use`](browser-use/README.zh.md) — 浏览器提供方选择与共享契约。
- [`bundle`](bundle/README.zh.md) — 基础运行时与桌面应用组合。
- [`client`](client/README.zh.md) — 桌面渲染器服务、控件与功能面板。
- [`compaction`](compaction/README.zh.md) — 对话压缩与工具输出保留。
- [`computer-use`](computer-use/README.zh.md) — 电脑控制提供方注册。
- [`context`](context/README.zh.md) — 工作区指令与模型请求上下文。
- [`core`](core/README.zh.md) — Agent 执行、Session 事件、工具与提示词组装。
- [`credentials`](credentials/README.zh.md) — 凭据存储与提供方授权。
- [`deliverables`](deliverables/README.zh.md) — 交付文件与工作区变更记录。
- [`desktop`](desktop/README.zh.md) — 应用私有运行时与渲染器入口。
- [`document`](document/README.zh.md) — 供桌面预览使用的 Office 文档转换。
- [`experimental`](experimental/README.zh.md) — 需显式启用且契约仍可能变化的实验能力。
- [`extensions`](extensions/README.zh.md) — 运行时插件创建与有边界的扩展执行。
- [`feedback`](feedback/README.zh.md) — 用户反馈与消息评分。
- [`fs`](fs/README.zh.md) — 文件系统提供方、工作区限制与文件工具。
- [`goal`](goal/README.zh.md) — 持久目标与同一 Session 内的继续执行。
- [`guard`](guard/README.zh.md) — 执行时限与重复调用提醒。
- [`hooks`](hooks/README.zh.md) — Hook 协议与既有集成的适配器。
- [`host`](host/README.zh.md) — 本地 Desktop 传输与操作系统服务。
- [`identity`](identity/README.zh.md) — 上报服务使用的本地匿名身份。
- [`interaction`](interaction/README.zh.md) — 用户审批、提问与对话命令。
- [`jobs`](jobs/README.zh.md) — 后台任务与有界输出观察。
- [`llm`](llm/README.zh.md) — 模型请求、提供方路由、重试与 token 计量。
- [`lsp`](lsp/README.zh.md) — 语言服务器导航及面向模型的工具。
- [`mcp`](mcp/README.zh.md) — Model Context Protocol 工具与资源连接。
- [`memory`](memory/README.zh.md) — 长期记忆提供方、工具与管理操作。
- [`plan`](plan/README.zh.md) — 计划模式状态与用户审核的执行边界。
- [`preset`](preset/README.zh.md) — 面向 Session 的 Agent 组合与随包指令。
- [`ptc-runtime`](ptc-runtime/README.zh.md) — 沙箱内的程序化工具执行。
- [`runtime-diagnostics`](runtime-diagnostics/README.zh.md) — 实时运行时不变式与诊断上报。
- [`sandbox`](sandbox/README.zh.md) — 执行隔离与平台策略。
- [`schedule`](schedule/README.zh.md) — Host 管理的调度与持久投递历史。
- [`session`](session/README.zh.md) — Session 持久化、迁移、投影与遥测。
- [`session-query`](session-query/README.zh.md) — 会话搜索、读取与导出。
- [`settings`](settings/README.zh.md) — Host 管理的 schema 配置。
- [`shell`](shell/README.zh.md) — Shell 执行、环境处理与面向模型的命令。
- [`skill`](skill/README.zh.md) — 技能发现、加载、学习与审核。
- [`spill`](spill/README.zh.md) — 有界工具输出与溢出存储。
- [`ssh`](ssh/README.zh.md) — 通过 SSH 提供远端文件、进程及沙箱能力。
- [`storage`](storage/README.zh.md) — 类型化持久应用数据与存储后端。
- [`subagent`](subagent/README.zh.md) — 进程内 Agent 委派与继续执行控制。
- [`subprocess`](subprocess/README.zh.md) — 受管子进程、输出与进程树清理。
- [`telemetry`](telemetry/README.zh.md) — 产品事件与会话日志的独立传输。
- [`terminal`](terminal/README.zh.md) — 持久 PTY 会话与交互终端工具。
- [`todo`](todo/README.zh.md) — Session 日志中的任务清单更新。
- [`typert`](typert/README.zh.md) — 生成类型元数据与类型化 Remote 契约。
- [`util`](util/README.zh.md) — 共享路径、值、文件与生命周期基础工具。
- [`web`](web/README.zh.md) — 桌面 Agent 使用的网页搜索与抓取工具，不是网站入口。
- [`webhook`](webhook/README.zh.md) — 把已验证的外部事件接入 Workspace Session。
- [`workflow`](workflow/README.zh.md) — 模型编写的工作流与新 Agent 迭代。
- [`workspace`](workspace/README.zh.md) — 持久工作区记录与 Session 归属关系。

## 开发

执行 `pnpm install --frozen-lockfile` 与 `pnpm run build:official`。仓库保留继承的 `@deepseek-ai/dsh-*` 标识以维持兼容。
