---
description: "Bundled Word, PowerPoint, and Excel workflows and structural checks"
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-office

[English](README.md) | 中文

## 概述


## 目录

- [使用本包](#use-this-package)
- [了解实现](#understand-the-implementation)
- [延伸阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与暂缓事项](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>

本包属于太易桌面运行时。Electron 与应用拥有的 Host 是产品入口，本 README 记录包契约。

## 使用本包

将本提供方与 skill 注册表及 `dsh-tool-skill` 一同挂载，即可在会话目录中提供 `office-docx`、`office-pptx` 和 `office-xlsx`。提供方携带指令和脚本；部署提供解释器、编写库、执行工具与文件交付工具。

### 最小配置

```yaml
- name: '@deepseek-ai/dsh-skill-office'
```

| 字段 | 默认值 | 含义 |
|---|---|---|
| `assetRoot` | 包内的 `assets/` | 包含三个 skill 文件夹和共享 `scripts/` 的绝对资源目录；部署可将其放在应用归档之外。 |
| `node` | 当前独立 Node 进程 | Node 可执行文件的绝对路径；Electron 和独立 SDK 可执行文件必须显式提供。 |

相对路径、资源缺失或 skill 文件的 YAML frontmatter 缺少描述都会导致激活失败。卸载插件会移除其候选项。项目和用户 skill 的优先级仍由 skill 注册表负责。


### 结构检查

共享 Python 检查器读取 DOCX、PPTX 或 XLSX，不修改源文件。它识别 Transitional 与 Strict OOXML 命名空间，验证 ZIP/XML 和包内引用关系，报告文档结构，并可检查必需文本或幻灯片／工作表数量。DOCX 文本断言覆盖正文、分节引用的页眉和页脚，以及正文引用的脚注和尾注；批注、词库文本与未引用的部件或脚注／尾注不能满足断言。它只使用 Python 标准库。无效包、损坏或加密的 ZIP 成员和报告文件写入失败都会在标准输出中产生 JSON 失败报告。检查通过不代表外观、特性保留或公式计算结果已得到验证。

Excel 数据和公式任务跳过视觉检查；涉及格式、排版、图表外观、打印或已知显示问题时，检查相关区域。基础样式设置本身不触发视觉检查，公式重算和用户要求的导出仍是独立操作。 空白或透明预览不能通过视觉检查。预览失败时结束视觉检查，不创建诊断工作簿、不转换 PDF，也不擅自修改打印设置；交付可用工作簿并说明检查限制。

-----

<a id="understand-the-implementation"></a>
## 了解实现

<details>
<summary>实现细节——点击展开</summary>

提供方注册三个内置候选项，并在激活时从随包 YAML frontmatter 读取描述。加载后的指令正文不包含这些元数据。加载后的每个 skill 暴露自己的文件系统目录，因此执行工具可以定位共享检查器，而不依赖任务工作目录。可配置的外部资源支持 Python 无法读取应用归档的分发方式。

| 文件 | 职责 |
|---|---|
| [`src/index.ts`](src/index.ts) | 提供方注册与配置资源路径。 |
| [`assets/`](assets/) | 三种工作流和只读 OOXML 检查器。 |
| — | 不发布运行时不变量伴随入口：提供方拥有不可变候选项，skill 注册表负责注册生命周期和优先级。 |

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

- [skill 注册表](../skill/README.zh.md)——发现与优先级。
- [skill 工具](../tool-skill/README.zh.md)——模型可见目录与正文。
- [文件交付](../../deliverables/tool-present/README.zh.md)——当前源路径交付。

-----

<a id="model-experience"></a>
## 模型体验

通过 `dsh-tool-skill` 间接呈现，由其渲染目录项与选中的指令正文。

#### KV 缓存影响

挂载提供方会增加三个目录项；加载 skill 时，其正文进入既有 skill 工具的插入位置。提供方不另增提示词分区。

## 已知限制与暂缓事项

<a id="known-limitations-and-deferred-work"></a>

- 提供方依赖 LibreOffice Kit，但不安装 Python 或编写库。检查器要求 Python 3.9 或更高版本。
- 结构检查不判断分页、裁切、字体、图表外观或 Excel 重算。
- 检查器只接受 DOCX、PPTX 和 XLSX；传统格式、加密文件和启用宏的格式需要合适的其他工作流。

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
