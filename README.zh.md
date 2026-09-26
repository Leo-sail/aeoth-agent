# 太易（Aeoth Agent）

[English](README.md)

太易是面向本地文件、代码与工具的 AI Agent 应用，提供桌面端和 Web 入口。

## 当前版本

- 产品版本：**0.1.0-preview.3**。
- 固定上游来源：`dsh-v0.1.7-rc.2`，commit `477b4f420553e8a52c2fbccc464d7561b239c443`。
- 桌面用户引导不依赖账号登录；模型接口和 API Key 由用户在「设置 → 模型」中自行配置。
- 「登录」「联系我们」暂时关闭，创造模式使用 Aeoth 品牌。
- 按仓库所有者要求，此分发版不包含自动化测试、测试夹具、录制快照、基准及测试支持包；运行代码、迁移、内置技能、原生资源、锁文件与许可证保留。

## 从源码安装运行

需要 Node.js `^22.19.0` 或 `>=24.0.0`、`package.json` 指定的 pnpm，以及对应系统的原生编译环境。

```sh
pnpm install --frozen-lockfile
pnpm run build:official
pnpm run start:web
```

使用启动器输出的本地鉴权地址，不要公开其中的访问令牌。首次运行会创建新的配置和应用数据；仓库不附带任何用户模型配置、凭据或会话。

桌面源码开发与打包说明见 [apps/desktop/README.zh.md](apps/desktop/README.zh.md)。打包时按需复制环境示例并填写自己的配置，不得提交真实环境文件或签名凭据。

## 桌面安装包

macOS Apple Silicon 安装包为 ad-hoc 本地预览，尚未正式签名和公证。为保持源码干净，安装包和本机构建归档不放入此源码树；仓库授权完成后，应从锁定源码在 private release 流程中生成并分发。

## 隐私与来源

源码不得包含个人 API Key、会话、本机配置、升级备份、依赖目录或构建缓存。旧版本产物不在本分发版范围内。

为兼容继承机制，部分第三方包名和协议标识保持真实名称。来源与许可见 [LICENSE](LICENSE) 和 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)；private 仓库仍须保留第三方版权与许可。
