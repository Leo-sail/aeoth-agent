# @deepseek-ai/dsh-command-learn

提供经验到技能闭环的人工命令：

```text
/learn <来源、URL、路径或流程>
```

命令会排队一个明确的模型步骤，由模型搜索已有技能、检查来源、创建或更新 `SKILL.md`，再验证结果。命令本身不绕过授权直接写文件；实际写入仍通过正常工具权限完成。

No invariant companion is published because this package exposes no independent runtime-diagnostic invariant.
