# 太易（Aeoth Agent）

[English](README.md) | 中文

太易是一款基于 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) 的开源桌面 AI Agent 应用。它把 dsh 运行时封装进一个 Electron 桌面应用，打包成可以直接安装的 macOS 应用。

项目完全开源，欢迎通过 GitHub Issues 和 Discussions 提交反馈和 Bug。

**创作者：** leochang — leochang210@gmail.com

---

## 它能做什么

打开太易，你得到的是一个完整的 dsh 运行时跑在本地。它在 dsh 基础上额外提供：

- **桌面壳** — 原生窗口管理、本地 Profile 隔离、托盘图标。除了模型调用，数据不出本机。

其他功能——Agent 执行引擎、LLM 路由、工具调用、会话管理、Skills、MCP 服务支持——全部直接继承自 dsh 核心，太易没有替换或重写这些层。

---

## 快速开始：安装应用

从 [Releases](https://github.com/Leo-sail/aeoth-agent/releases) 页面下载最新的 macOS Apple Silicon 未签名 DMG。

因为是 ad-hoc 签名而非公证版本，macOS 第一次打开时会拒绝。绕过方法：

1. 打开 DMG，把太易拖到「应用程序」文件夹。
2. 第一次尝试启动时，macOS 会弹出「无法打开，因为无法验证开发者」的提示，点击**取消**——不要点「移到废纸篓」。
3. 打开**系统设置 → 隐私与安全性**，滚动到底部，会看到关于太易被阻止的提示，点击**仍要打开**。
4. 再弹出一个确认对话框，点击**打开**。

之后每次正常启动，不再需要这个步骤。

---

## 首次配置

太易第一次启动时会在 `~/.aeoth/` 创建本地 Profile，默认没有配置任何模型。

1. 点击左下角的齿轮图标（设置）。
2. 进入**模型**，添加你使用的 API Key（DeepSeek、OpenAI、Anthropic 等主流服务商都支持）。
3. 选择一个默认模型。
4. 关闭设置，可以开始用了。

---

## 从源码构建

依赖：Node.js `^22.19.0` 或 `>=24.0.0`，pnpm `11.7.0`，macOS 上需要 Xcode Command Line Tools。

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run start:desktop
```

进入增量开发模式（修改后自动重建）：

```sh
pnpm run dev:desktop
```

打包 macOS ARM64 未签名 DMG：

```sh
cp apps/desktop/.env.macos.example apps/desktop/.env.macos
pnpm run package:desktop:mac:arm64:unsigned
```

产物输出到 `apps/desktop/.desktop-build/targets/mac-arm64/unsigned-artifacts/`。

---

## 目录结构

```
apps/desktop/          Electron 壳、原生窗口、更新流程、打包资源
apps/desktop-host/     Electron 应用持有的私有 Node Host 进程
packages/desktop/      桌面运行时与渲染器入口包
packages/bundle/       桌面 Profile 组合
packages/client/       浏览器侧 UI 插件（对话、工作区、设置等）
packages/core/         核心服务（会话、存储等）
packages/api/          Host 侧 Remote API 控制器
packages/host/         本地传输和静态资源服务
docs/                  架构和子系统文档
```

---

## 基线与来源

太易基于 dsh 的一个固定快照构建：

- **基线：** `dsh-v0.2.0-rc.2`，commit `639ed015397290b3745d163aafe02ffee4aa3f84`
- **产品版本：** `0.1.0-preview.4`

按上游许可，本仓库不包含自动化测试套件、测试夹具、基准数据和用户凭据。

第三方包的名称、许可证和署名信息完整保留在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

---

## 参与贡献

Bug 反馈和功能建议请提 [GitHub Issues](https://github.com/Leo-sail/aeoth-agent/issues)。

代码贡献请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。简版：一个 PR 一个逻辑变更，Conventional Commits 格式，不在 commit 里放密钥或本机路径。

---

## 许可证

MIT — 详见 [LICENSE](LICENSE)。
