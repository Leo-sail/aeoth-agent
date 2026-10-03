---
description: "Web search and fetch tools used by Desktop agents; not a website."
kind: "package-group"
---

# packages/web

English | [中文](README.zh.md)

## Overview

Web search and fetch tools used by Desktop agents; not a website. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-tool-web`](tool-web/README.md) — Model-facing web tools (web_search, web_fetch) over the Aeoth Agent web capability seam (ctx.web)
- [`@deepseek-ai/dsh-web`](web/README.md) — Abstract web access capability seam (ctx.web) for the Aeoth Agent — search/fetch provider registry, registration-order-independent selection, request/result vocabulary, and the WebError taxonomy
- [`@deepseek-ai/dsh-web-fetch-http`](web-fetch-http/README.md) — Anonymous public HTTP(S) fetch provider for the Aeoth Agent web capability seam (ctx.web)
- [`@deepseek-ai/dsh-web-search-deepseek`](web-search-deepseek/README.md) — DeepSeek-backed search provider (native web_search via the Anthropic-compatible API) for the Aeoth Agent web capability seam (ctx.web)
- [`@deepseek-ai/dsh-web-search-exa`](web-search-exa/README.md) — Exa-backed search provider for the Aeoth Agent web capability seam (ctx.web)
- [`@deepseek-ai/dsh-web-search-perplexity`](web-search-perplexity/README.md) — Perplexity-backed search provider for the Aeoth Agent web capability seam (ctx.web)

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
