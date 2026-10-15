---
description: "需显式启用且契约仍可能变化的实验能力。"
kind: "package-group"
---

# packages/experimental

[English](README.md) | 中文

## 概述

需显式启用且契约仍可能变化的实验能力。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-experimental-api-speech-to-text`](api-speech-to-text/README.zh.md) — Authenticated experimental speech transcription for browser clients
- [`@deepseek-ai/dsh-experimental-auto-review`](auto-review/README.zh.md) — Per-tool LLM authorization review for the Aeoth Agent Auto permission preset
- [`@deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp`](browser-use-chrome-devtools-mcp/README.zh.md) — Experimental per-Session Chromium browser tools through chrome-devtools-mcp
- [`@deepseek-ai/dsh-experimental-browser-use-playwright-mcp`](browser-use-playwright-mcp/README.zh.md) — Experimental per-Session Chromium browser tools through @playwright/mcp
- [`@deepseek-ai/dsh-experimental-browser-use-runtime`](browser-use-runtime/README.zh.md) — Session-owned browser resource lifecycles and MCP integration for experimental providers
- [`@deepseek-ai/dsh-experimental-browser-use-stagehand-native`](browser-use-stagehand-native/README.zh.md) — Experimental Stagehand browser tools with separately configured native models
- [`@deepseek-ai/dsh-experimental-client-ui-voice-input`](client-ui-voice-input/README.zh.md) — Record speech and insert editable text into the conversation draft
- [`@deepseek-ai/dsh-experimental-computer-use-cua-driver-mcp`](computer-use-cua-driver-mcp/README.zh.md) — Experimental computer use through an installed Cua Driver MCP executable
- [`@deepseek-ai/dsh-experimental-computer-use-cua-driver-native`](computer-use-cua-driver-native/README.zh.md) — Experimental computer-use provider embedding the Cua Driver native npm SDK
- [`@deepseek-ai/dsh-experimental-ptc-runtime-python`](ptc-runtime-python/README.zh.md) — CPython subprocess implementation of the Aeoth Agent PTC execution seam
- [`@deepseek-ai/dsh-experimental-schedule-bundle`](schedule-bundle/README.zh.md) — Optional bundle that adds Schedule, its task page, and time context to the Web composition
- [`@deepseek-ai/dsh-experimental-speech-to-text`](speech-to-text/README.zh.md) — Experimental speech recognition with independently selectable providers
- [`@deepseek-ai/dsh-experimental-speech-to-text-sensevoice`](speech-to-text-sensevoice/README.zh.md) — Local SenseVoice ONNX transcription with a managed sherpa-onnx process
- [`@deepseek-ai/dsh-experimental-voice-input-bundle`](voice-input-bundle/README.zh.md) — Experimental voice input with local SenseVoice; downloads its runtime on first use

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
