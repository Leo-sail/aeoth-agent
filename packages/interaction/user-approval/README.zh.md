---
description: "User-approval seam (ctx.approval) for the Aeoth Agent: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default"
kind: "package-reference"
---

# @deepseek-ai/dsh-user-approval

[English](README.md) | 中文

## 概述

User-approval seam (ctx.approval) for the Aeoth Agent: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default。本包属于太易桌面运行时，由应用拥有的 Host 或渲染器组合使用。

## 使用范围

- **范围：** `packages/interaction/user-approval` 负责这一能力边界。
- **入口：** 运行时代码从 `lib/index.js` 导出；存在公共类型时从 `lib/types/index.d.ts` 导出。
- **产品边界：** Electron Desktop 是产品入口，本页记录包契约。

## 组合关系

- **运行时依赖：** 由 `package.json` 声明。
- **包分组：** 参见[父级包地图](../README.zh.md)。
- **生命周期：** 组合与清理由使用它的 Desktop profile 或 Host/Client 层负责。

## 源码

- [`src/`](src/) — 实现代码和公共源码契约。
- [`package.json`](package.json) — 导出、依赖和发布元数据。
- 使用 `pnpm run build` 构建完整组合。

## Desktop 交付

- 本包只作为太易桌面端源码和运行时闭包的一部分保留。
- 本包不负责独立产品入口或安装包。

## 许可证

本包遵循仓库许可证；第三方依赖和来源记录见 [`THIRD_PARTY_NOTICES.md`](../../../THIRD_PARTY_NOTICES.md)。
