---
description: "Aeoth Agent Desktop runtime: profile composition and lifecycle for the Electron application"
kind: "package-reference"
---

# @deepseek-ai/dsh

[English](README.md) | 中文

本包属于太易桌面运行时。Electron 与应用拥有的 Host 是产品入口，本 README 记录包契约。

加载应用拥有的 Desktop profile，并组合 bundle 和 patch 层。私有 Host 负责就绪、取消与关闭，本包不提供公共可执行入口。

## 开发

本包随太易桌面端开发。环境准备见[源码运行](../../../README.zh.md#run-from-source)，打包方式见[Desktop 开发说明](../../../apps/desktop/README.zh.md)。

## 源码

- [`src/profile-boot.ts`](src/profile-boot.ts)：Profile 生命周期
- [`package.json`](package.json)：导出与依赖声明。

## 文档

- [包分组](../README.zh.md)
- [许可证与来源](../../../THIRD_PARTY_NOTICES.md)
## Desktop 交付

- 本包只作为太易桌面端的源码和运行时闭包保留。
- 本包不负责独立产品入口或安装包。

## 许可证

本包遵循仓库许可证；第三方依赖和来源记录见 [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md)。
