# 开发指南

[English](development.md) | 中文

本指南覆盖公开源码分发：前置条件、安装、构建和本机启动。自动化测试套件、私有 CI 门禁、基准数据、本机 agent 指令和发布凭据均不包含在此源码树中。

## 前置条件

- Node.js `^22.19.0` 或 `>=24.0.0`。
- 根 `package.json` 声明的 pnpm `11.7.0`。
- Git 2.26 或更高版本。
- 目标操作系统所需的原生构建工具。

## 安装

```sh
corepack enable
pnpm install --frozen-lockfile --ignore-scripts
```

干净源码不会运行仓库钩子，也不会读取开发者 home。应用配置、凭据、会话和生成产物必须放在 checkout 外部。

## 构建

```sh
pnpm run build:official
```

单独构建各表面：

```sh
pnpm run build:lib
pnpm run build:web
pnpm run build:desktop
```

构建产物已被忽略，不能提交。Web 与 Desktop 启动器使用 Aeoth 产品命名；为保持兼容，上游 package identity 仍按要求保留。

## 启动

```sh
pnpm run start:web
pnpm run start:desktop
```

源码修改后自动重建：

```sh
pnpm run dev:web
pnpm run dev:desktop
```

验证 checkout 时请使用显式的应用 home。不要让源码 checkout 指向已有个人 profile，也不要把凭据复制进仓库。

## Desktop 打包

```sh
pnpm run package:desktop:mac:arm64
pnpm run package:desktop:mac:x64
pnpm run package:desktop:win:x64
```

签名、公证、更新源配置和上传凭据属于部署方输入，公开源码树不提供这些内容。

## Python 包

Python SDK 和 runtime carrier 位于 `python/`。先完成 JavaScript runtime 构建，再按照各包 README 进行 wheel 暂存。Python 包元数据不包含仓库本机凭据或用户数据。

## 源码与来源

Aeoth 基于 `dsh-v0.2.0-rc.2`、commit `639ed015397290b3745d163aafe02ffee4aa3f84`；产品版本记录见 [`aeoth-release.json`](../aeoth-release.json)。重新分发源码时请保留 [`LICENSE`](../LICENSE) 与 [`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md)。
