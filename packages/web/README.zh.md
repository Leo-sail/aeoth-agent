---
description: "桌面 Agent 使用的网页搜索与抓取工具，不是网站入口。"
kind: "package-group"
---

# packages/web

[English](README.md) | 中文

## 概述

桌面 Agent 使用的网页搜索与抓取工具，不是网站入口。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-tool-web`](tool-web/README.zh.md) — Model-facing web tools (web_search, web_fetch) over the Aeoth Agent web capability seam (ctx.web)
- [`@deepseek-ai/dsh-web`](web/README.zh.md) — Abstract web access capability seam (ctx.web) for the Aeoth Agent — search/fetch provider registry, registration-order-independent selection, request/result vocabulary, and the WebError taxonomy
- [`@deepseek-ai/dsh-web-fetch-http`](web-fetch-http/README.zh.md) — Anonymous public HTTP(S) fetch provider for the Aeoth Agent web capability seam (ctx.web)
- [`@deepseek-ai/dsh-web-search-deepseek`](web-search-deepseek/README.zh.md) — DeepSeek-backed search provider (native web_search via the Anthropic-compatible API) for the Aeoth Agent web capability seam (ctx.web)
- [`@deepseek-ai/dsh-web-search-exa`](web-search-exa/README.zh.md) — Exa-backed search provider for the Aeoth Agent web capability seam (ctx.web)
- [`@deepseek-ai/dsh-web-search-perplexity`](web-search-perplexity/README.zh.md) — Perplexity-backed search provider for the Aeoth Agent web capability seam (ctx.web)

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
