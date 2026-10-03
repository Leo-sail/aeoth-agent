# 太易（Aeoth Agent）桌面端

[English](README.md) | 中文

太易桌面端是产品入口。Electron 负责窗口、私有 Host、本地 profile、工作区及应用生命周期。

## 开发者预览

产品版本为 **0.1.0-preview.3**。模型接口与 API Key 在应用内配置，本地预览不要求登录产品账号。

## 开发

在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm run build:official
pnpm run start:desktop
```

增量开发使用 `pnpm run dev:desktop`。启动器使用独立的开发 profile 与 Electron 数据目录。不要用真实用户 profile 进行验证。

## 打包 macOS

将 `apps/desktop/.env.macos.example` 复制为 `apps/desktop/.env.macos`。未签名预览不填写签名或上传凭据，然后运行：

```sh
pnpm run package:desktop:mac:arm64:unsigned
```

打包命令构建应用、准备生产依赖并核对最终 ASAR 文件清单。Node、CPython 和 Python wheel 由 `scripts/primary-runtime/lock.json` 锁定，Electron 使用锁定 npm 包提供的校验和。缓存文件与网络下载文件遵循相同校验。

构建结果位于本目录的 `.desktop-build/targets/mac-arm64/unsigned-artifacts/`。完成归档与隔离启动验证后，将 DMG、ZIP 和校验清单放入仓库根目录的 `release/0.1.0-preview.3/mac-arm64/`。运行验证使用临时目录，不在仓库保留测试套件。

## 运行时

应用包含私有 Host、渲染器、生产 Node 依赖、内嵌解释器与 Office 资源。Electron 管理 Desktop profile，并向回环地址上的 Host 转发已认证请求。本地服务不是公网部署入口。

## 发布边界

- 预览产物使用 ad-hoc 签名，不等于 Developer ID 签名或 Apple 公证。
- 正式签名需要独立凭据。不要提交密钥、证书、profile 或本地环境文件。
- 打包不代表授权上传。仓库推送与安装包发布是独立操作，必须等待用户确认。

## 许可证

参见仓库[许可证](../../LICENSE)与[第三方声明](../../THIRD_PARTY_NOTICES.md)。
