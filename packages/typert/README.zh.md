---
description: "生成类型元数据与类型化 Remote 契约。"
kind: "package-group"
---

# packages/typert

[English](README.md) | 中文

## 概述

生成类型元数据与类型化 Remote 契约。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-typert-generator`](generator/README.zh.md) — TypeScript project analyzer and model-driven Typert artifact generator
- [`@deepseek-ai/dsh-typert-loader`](loader/README.zh.md) — Loader integration for generated Typert package contributions
- [`@deepseek-ai/dsh-typert-protocol`](protocol/README.zh.md) — Compiler-independent Remote metadata and Typert provider protocols
- [`@deepseek-ai/dsh-typert-registry`](registry/README.zh.md) — Runtime registry for generated package reflection and Zod schemas

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
