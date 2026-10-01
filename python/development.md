# Python development

English | [中文](development.zh.md)

The Python SDK and runtime carrier are public source packages. The repository does not include Python test suites, test fixtures, benchmark snapshots, or real credentials. Keep virtual environments and generated wheels outside the checkout.

## Install the local packages

```sh
python -m pip install -e python/sdk -e python/sdk-runtime
```

Every launch requires an explicit `AEOTH_HOME`; the SDK never silently uses a personal home.

```python
from aeoth_agent import AeothAgent

with AeothAgent(
    aeoth_home="/absolute/path/to/isolated-aeoth-home",
    cwd="/absolute/path/to/workspace",
) as agent:
    result = agent.run("Say hi.")
    print(result.final_response)
```

## Build the runtime carrier

From the repository root, build the JavaScript runtime and then stage a platform carrier:

```sh
pnpm run build:official
pnpm exec tsx scripts/build-exe-for-python-sdk.ts
```

The generated executables, native sidecars, virtual environments, and release wheels are local build outputs and are not committed.

## Release inputs

The root version is the source of truth for the Python distribution metadata. Publishing requires platform-specific native build infrastructure, signing where applicable, and deployment-owned package credentials; none are stored in this repository.
