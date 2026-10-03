---
description: "Bundled dsh badge skill provider for Aeoth Agent"
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-badge

[English](README.md) | 中文

## 概述


## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>

本包属于太易桌面运行时。Electron 与应用拥有的 Host 是产品入口，本 README 记录包契约。

## 使用本包

启用插件即可让 `dsh-badge` skill 出现在会话 skill 目录中；随后模型可以像加载任何其他 skill 一样加载它，并遵循其指令添加「powered by Aeoth Agent」徽章。

### 何时选择

当用 Aeoth Agent 生成的内容应携带官方署名徽章、且部署方希望该徽章 skill 对 agent 可用而无需存入本地 skill 目录时，选择此提供方。当徽章与部署无关时，请跳过——插件默认禁用，启用前不增加任何东西。

### 启用插件


```yaml
- name: '@deepseek-ai/dsh-skill-badge'
```

启用后，`dsh-badge` 会出现在会话目录的可用 skill 中。该 skill 提供本地 Markdown 标记和随包分发的 PNG 徽章资源；它不假设托管图片或项目 URL。

### 徽章 skill 提供什么

- **Markdown 片段。** 在文档、PR 与 merge request 中嵌入官方徽章标记的指令。
- **随包分发的 PNG 资源。** `dsh-badge.png`（726×120 源图，按 121×20 渲染），在无法导入远程图片的环境中可用。

### 可观察的成功与失败

启用插件会使 `dsh-badge` 出现在目录中并可凭名称加载；禁用或省略该行则它不会出现在任何目录中。由于提供方不可变，发现始终成功且恰好返回一个 skill，绝不会报告部分结果。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

本节解释内置提供方如何接线；可观察行为已在[使用本包](#use-this-package)中完整说明。

### 设计理念

该提供方是一个不可变、同步注册的 skill 来源：它以 `dsh-badge` 作为提供方名称、按内置 skill rank（600）注册一个固定候选项，把随包分发的 `assets/` 目录作为该 skill 的目录资源基底公开，并在每次加载时从随包分发的 `assets/dsh-badge.md` 文件读取 skill 正文。

### 源码地图

| 文件 | 职责 |
|---|---|
| [`src/index.ts`](src/index.ts) | 插件入口与不可变提供方：一个候选项、资源基底、正文加载 |
| — | 不发布运行时不变式伴生入口；本包只持有一个不可变的提供方注册，注册唯一性与生命周期检查由 skill 注册表负责。 |
| [`assets/`](assets/) | 随包分发的 skill 正文（`dsh-badge.md`）与 PNG 资源（`dsh-badge.png`） |

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

当包级约定不够用时，请阅读以下页面。这些页面先介绍该提供方注册到的注册表，再说明 skill 如何到达模型。

- [skill 子系统参考](../../../docs/subsystems/skills.zh.md)——该提供方实现的注册表与提供方约定。
- [skill 包](../skill/README.zh.md)——该提供方注册到的注册表，以及已加载 skill 的共享渲染。
- [tool-skill 包](../tool-skill/README.zh.md)——徽章 skill 如何到达会话目录与模型。

-----

<a id="model-experience"></a>
## 模型体验

通过 `dsh-tool-skill` 间接影响模型；该包会把该提供方的目录条目和所选 skill 的正文渲染给模型。

#### KV Cache 影响

该插件默认禁用，不会改变任何请求。启用后，其目录条目和任何已加载正文都会在各自插入点改变提供方的 KV 前缀。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>


这些限制说明内置提供方不做什么。它们是当前包约束，不是任务积压。

- **固定一个 skill，无运行时自定义**——提供方恰好贡献 `dsh-badge` 这一个 skill；需要其他徽章变体的部署请自行编写 skill。
- **不依赖托管徽章端点**——使用本地 Markdown 图片或随包分发的 PNG；只有用户提供并批准时才添加公共 URL。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>
## Desktop 交付

- 本包只作为太易桌面端的源码和运行时闭包保留。
- 本包不负责独立产品入口或安装包。

## 许可证

本包遵循仓库许可证；第三方依赖和来源记录见 [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md)。
