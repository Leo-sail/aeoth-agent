---
description: "the Aeoth runtime desktop application surface bundle: the web patch layer over dsh-base plus the runtime glue plugin (frontend dist serving, web-surface prompt, bash runtime variables, URL line)"
kind: "package-reference"
---

# @deepseek-ai/dsh-desktop-app

[English](README.md) | 中文

本包属于太易桌面运行时。Electron 与应用拥有的 Host 是产品入口，本 README 记录包契约。

在 base bundle 上组合 Desktop Host 服务、渲染器插件和 Agent preset。Electron 负责启动，本包提供本地静态资源与面向模型的桌面上下文。

## 开发

本包随太易桌面端开发。环境准备见[源码运行](../../../README.zh.md#run-from-source)，打包方式见[Desktop 开发说明](../../../apps/desktop/README.zh.md)。

## 源码

- [`src/index.ts`](src/index.ts)：服务或插件入口
- [`cordis.patch.yml`](cordis.patch.yml)：组合声明
- [`package.json`](package.json)：导出与依赖声明。

## 文档

- [包分组](../README.zh.md)
- [许可证与来源](../../../THIRD_PARTY_NOTICES.md)
## Desktop 交付

- 本包只作为太易桌面端的源码和运行时闭包保留。
- 本包不负责独立产品入口或安装包。

## 许可证

本包遵循仓库许可证；第三方依赖和来源记录见 [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md)。
