# Python 开发

[English](development.md) | 中文

Python SDK 与 runtime carrier 是公开源码包。仓库不包含 Python 测试套件、测试夹具、基准快照或真实凭据。虚拟环境和生成的 wheel 必须放在 checkout 外部。

## 安装本地包

```sh
python -m pip install -e python/sdk -e python/sdk-runtime
```

每次启动都必须显式提供 `AEOTH_HOME`；SDK 不会静默使用个人 home。

```python
from aeoth_agent import AeothAgent

with AeothAgent(
    aeoth_home="/absolute/path/to/isolated-aeoth-home",
    cwd="/absolute/path/to/workspace",
) as agent:
    result = agent.run("Say hi.")
    print(result.final_response)
```

## 构建 runtime carrier

在仓库根目录先构建 JavaScript runtime，再暂存目标平台 carrier：

```sh
pnpm run build:official
pnpm exec tsx scripts/build-exe-for-python-sdk.ts
```

生成的可执行文件、原生 sidecar、虚拟环境和发布 wheel 都属于本机构建产物，不能提交。

## 发布输入

根版本是 Python 分发元数据的真源。发布需要平台原生构建环境、必要的签名以及部署方包仓库凭据；这些内容不会存储在本仓库。
