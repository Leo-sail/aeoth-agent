---
description: "Opt-in capabilities whose contracts may still change."
kind: "package-group"
---

# packages/experimental

English | [中文](README.zh.md)

## Overview

Opt-in capabilities whose contracts may still change. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-experimental-api-speech-to-text`](api-speech-to-text/README.md) — Authenticated experimental speech transcription for browser clients
- [`@deepseek-ai/dsh-experimental-auto-review`](auto-review/README.md) — Per-tool LLM authorization review for the Aeoth Agent Auto permission preset
- [`@deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp`](browser-use-chrome-devtools-mcp/README.md) — Experimental per-Session Chromium browser tools through chrome-devtools-mcp
- [`@deepseek-ai/dsh-experimental-browser-use-playwright-mcp`](browser-use-playwright-mcp/README.md) — Experimental per-Session Chromium browser tools through @playwright/mcp
- [`@deepseek-ai/dsh-experimental-browser-use-runtime`](browser-use-runtime/README.md) — Session-owned browser resource lifecycles and MCP integration for experimental providers
- [`@deepseek-ai/dsh-experimental-browser-use-stagehand-native`](browser-use-stagehand-native/README.md) — Experimental Stagehand browser tools with separately configured native models
- [`@deepseek-ai/dsh-experimental-client-ui-voice-input`](client-ui-voice-input/README.md) — Record speech and insert editable text into the conversation draft
- [`@deepseek-ai/dsh-experimental-computer-use-cua-driver-mcp`](computer-use-cua-driver-mcp/README.md) — Experimental computer use through an installed Cua Driver MCP executable
- [`@deepseek-ai/dsh-experimental-computer-use-cua-driver-native`](computer-use-cua-driver-native/README.md) — Experimental computer-use provider embedding the Cua Driver native npm SDK
- [`@deepseek-ai/dsh-experimental-ptc-runtime-python`](ptc-runtime-python/README.md) — CPython subprocess implementation of the Aeoth Agent PTC execution seam
- [`@deepseek-ai/dsh-experimental-schedule-bundle`](schedule-bundle/README.md) — Optional bundle that adds Schedule, its task page, and time context to the Web composition
- [`@deepseek-ai/dsh-experimental-speech-to-text`](speech-to-text/README.md) — Experimental speech recognition with independently selectable providers
- [`@deepseek-ai/dsh-experimental-speech-to-text-sensevoice`](speech-to-text-sensevoice/README.md) — Local SenseVoice ONNX transcription with a managed sherpa-onnx process
- [`@deepseek-ai/dsh-experimental-voice-input-bundle`](voice-input-bundle/README.md) — Experimental voice input with local SenseVoice; downloads its runtime on first use

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
