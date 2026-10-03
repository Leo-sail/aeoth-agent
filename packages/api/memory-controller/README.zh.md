---
description: "Memory and skill management Remote namespace for Desktop runtime"
kind: "package-reference"
---

# @deepseek-ai/dsh-api-memory-controller

[English](README.md) | 中文

本包属于太易桌面运行时。Electron 与应用拥有的 Host 是产品入口，本 README 记录包契约。

提供长期记忆、来源记录、技能、整理候选与迁移计划的桌面管理操作。读写通过各自的记忆和技能服务完成。

## 开发

本包随太易桌面端开发。环境准备见[源码运行](../../../README.zh.md#run-from-source)，打包方式见[Desktop 开发说明](../../../apps/desktop/README.zh.md)。

## 源码

- [`src/index.ts`](src/index.ts)：服务或插件入口
- [`src/client/index.ts`](src/client/index.ts)：渲染器入口
- [`src/types.ts`](src/types.ts)：公共类型
- [`package.json`](package.json)：导出与依赖声明。

## 文档

- [包分组](../README.zh.md)
- [许可证与来源](../../../THIRD_PARTY_NOTICES.md)
## Desktop 交付

- 本包只作为太易桌面端的源码和运行时闭包保留。
- 本包不负责独立产品入口或安装包。

## 许可证

本包遵循仓库许可证；第三方依赖和来源记录见 [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md)。
