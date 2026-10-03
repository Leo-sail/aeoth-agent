# 太易（Aeoth Agent）

[English](README.md) | 中文

太易（Aeoth Agent）是面向本地文件、代码与工具的桌面 AI Agent 应用。Electron 桌面端是唯一产品入口；运行时、渲染器、插件组合和本地工作区都随桌面应用交付。

## 开发者预览

太易目前处于开发者预览阶段，兼容性与产品界面仍会继续调整。

- 产品版本：**0.1.0-preview.3**
- 固定来源：`dsh-v0.2.0-rc.2`，commit `639ed015397290b3745d163aafe02ffee4aa3f84`
- 仓库保留桌面端源码及其运行时依赖。
- 本源码分发不包含自动化测试套件、测试夹具、基准数据或用户凭据。

<a id="run-from-source"></a>

## 从源码运行

需要 Node.js `^22.19.0` 或 `>=24.0.0`、pnpm `11.7.0`，以及当前系统所需的原生编译环境。

```sh
pnpm install --frozen-lockfile
pnpm run build:official
pnpm run start:desktop
```

进入桌面开发循环：

```sh
pnpm run dev:desktop
```

首次启动会创建独立的本地 home 与 profile。请在「设置 → 模型」中配置模型接口和 API Key。不要提交凭据、会话、本机配置、`node_modules` 或构建缓存。

## 桌面分发

仓库面向 private 桌面分发准备。macOS Apple Silicon 本地交付目录为 `release/0.1.0-preview.3/mac-arm64/`，校验后保留 DMG、ZIP 与 SHA-256 校验清单。当前预览通道为 ad-hoc 签名，尚未构成正式公证发行版。

桌面打包命令见 [Desktop 开发说明](apps/desktop/README.zh.md)，其中包含运行时准备、Electron 打包、macOS 签名、Windows 打包和更新发布说明。上传是独立的、必须经用户授权的步骤。

## 目录结构

- `apps/desktop/`：Electron 壳、原生窗口、更新流程和打包资源。
- `apps/desktop-host/`：由 Electron 桌面端拥有的私有 Node Host。
- `packages/desktop/`：桌面运行时与渲染器入口包。
- `packages/bundle/desktop-app/`：桌面 profile 组合。
- `packages/client/desktop/`：渲染器启动内核。
- `packages/host/desktop-server/` 与 `packages/host/desktop-static/`：本地渲染器传输和静态资源服务。
- `migrations/` 与运行时包：持久化应用状态和 Agent 能力。

## 隐私与来源

仓库不得包含 API Key、用户会话、profile、升级备份、依赖目录或本机构建缓存。为保持兼容，第三方包名、许可证和来源记录在需要时保留。详见 [LICENSE](LICENSE) 与 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
