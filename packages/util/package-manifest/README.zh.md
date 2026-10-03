---
description: "Shared package manifest types and the Aeoth-to-DSH compatibility adapter"
kind: "package-library"
---

# @deepseek-ai/dsh-package-manifest

[English](README.md) | 中文

## 概述

本包定义继承运行时使用的 `Dsh*` 清单类型，并提供运行时适配器，使 Aeoth 自有的 package 元数据可以独立演进，而不必修改继承的加载器。`aeoth` 是公共配置源字段；`dsh` 是供继承运行时消费的兼容投影。

本包属于太易桌面运行时。Electron 与应用拥有的 Host 是产品入口，本 README 记录包契约。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与后续工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

使用类型导出描述 package 清单；所有运行时 package 清单的读取和写回边界都应使用适配器导出。

```ts
import {
  adaptAeothManifest,
  persistAeothManifest,
  withAeothProfileBundles,
} from '@deepseek-ai/dsh-package-manifest'
import type { AeothPackageManifest } from '@deepseek-ai/dsh-package-manifest'

const raw: Partial<AeothPackageManifest> = {
  name: 'example-dsh-plugin',
  version: '1.0.0',
  aeoth: {
    client: { platform: 'web', immediately: true },
  },
}

const compatible = adaptAeothManifest(raw)
```

`DshPackageManifest` 描述 DSH 使用的 package.json 字段，其中 `name` 和 `version` 必填；它不是完整的 npm schema（模式）。本地 profile 读取方使用 `Partial<DshPackageManifest>`，因为 profile 无需发布版本。`DshManifest` 仅描述 `dsh` 下的公共作者字段。`DshBundleManifest.patch` 是一个 patch 文件路径，或一个有序的路径列表，均相对于包根目录；launcher 按列表顺序把它们作为同一个组合包层应用。TypeScript 检查示例并删除 `import type`；这些接口不解析 JSON，也不写入文件。

适配器契约保持窄而明确：

| 输入或操作 | 结果 |
|---|---|
| 只有 `aeoth` | 读取时生成内部 `dsh` 投影；写回时同时持久化两个字段。 |
| 只有 `dsh` | 按继承元数据读写；不会添加 `aeoth` 字段。 |
| 两个字段同时存在 | 冲突时 `aeoth` 优先；已知 section 合并，并同步生成 `dsh` 投影。 |
| `withAeothProfileBundles` | 只修改公共 profile bundle 列表，然后重新生成兼容投影。 |

适配器 v2 支持有序 patch 数组。仅当 Aeoth profile 已启用新版团队组合包时，才移除已合并的旧团队 UI 组合包；其他组合包和纯上游清单保持不变。

`LocalizedText` 携带字面文本或带必需英文回退值的语言映射。`PluginLocalizedMeta` 携带已安装插件的可选展示标题、描述、从 `package.json.icon` 解析的图片 data URL，以及元信息诊断。[App boot](../../boot/app-boot/README.zh.md) 读取这些值；本包只提供其类型。

公共组合声明定义在 [`src/types.ts`](src/types.ts) 中。内部 `configTrees`、`sessionFormatMigration` 和生成的 `moduleFallback` 元数据分别由镜像打包器、目录生成器和启动器读取方拥有；公共类型不暴露这些字段。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

- [`src/types.ts`](src/types.ts) 包含继承的 `Dsh*` 声明和 Aeoth 自有源字段声明。
- [`src/adapter.ts`](src/adapter.ts) 是唯一翻译边界；上游清单发生变化时应先在这里处理。
- `AEOTH_MANIFEST_ADAPTER_VERSION` 标识诊断和升级记录使用的适配器契约版本。
- Profile boot、插件管理、Client module discovery、Typert 注册、Web watch discovery 和 package 校验均通过适配器读取，而不是从原始 JSON 直接读取 `manifest.dsh`。
- 本包不发布运行时不变量伴随模块，因为 package 元数据归一化没有独立持久化状态。

继承运行时内部继续消费归一化后的 `dsh` 视图是有意设计：公共配置命名被隔离，同时保留上游 package 和协议兼容性。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [Profile 启动器](../../boot/app-boot/README.zh.md#profiles)——profile 加载、bundle 组合和持久化。
- [插件管理器](../../boot/plugin-manager/README.zh.md)——profile bundle 的安装、启用、禁用和 reconcile。
- 公共包元数据——字段位置与读取方归属。

<a id="model-experience"></a>
## 模型体验

无，因为适配器只在运行时组合前归一化 package 元数据，不增加模型输入，也不改变 Agent 行为。

#### KV Cache 影响

不改变模型输入，因此不影响提供方缓存复用。

## 已知限制与后续工作

<a id="known-limitations-and-deferred-work"></a>

- **适配投影不是完整迁移引擎。** 当前适配器覆盖 bundle/profile/client 字段；上游清单形状变化时，必须先在 `src/adapter.ts` 中增加映射。
- **兼容性仍是声明。** `manifestVersion` 和 `engines.dsh` 只是声明；安装器和加载器不会自动拒绝不兼容版本。
- **内部仍可见旧字段。** 这是继承运行时的需要，不代表 `dsh` 是 Aeoth 公共配置源。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

升级继承 harness 时，先修改适配器和定向回归矩阵，再修改 profile、plugin-manager 或 client 业务逻辑。必须保持纯上游清单不被写入生成的 `aeoth` 字段。

</details>
## Desktop 交付

- 本包只作为太易桌面端的源码和运行时闭包保留。
- 本包不负责独立产品入口或安装包。

## 许可证

本包遵循仓库许可证；第三方依赖和来源记录见 [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md)。
