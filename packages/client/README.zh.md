---
description: "桌面渲染器服务、控件与功能面板。"
kind: "package-group"
---

# packages/client

[English](README.md) | 中文

## 概述

桌面渲染器服务、控件与功能面板。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-client-connection`](connection/README.zh.md) — Authenticated RPC transport and generation lifecycle
- [`@deepseek-ai/dsh-client-desktop`](desktop/README.zh.md) — Web boot kernel: static module table, Cordis loader, framework-free boot page, and UI-renderer handoff
- [`@deepseek-ai/dsh-client-file-upload`](file-upload/README.zh.md) — Agent-scoped browser file upload, streaming intake, and staged receipt service
- [`@deepseek-ai/dsh-client-hmr`](hmr/README.zh.md) — Desktop client graph synchronization and rebuilt-bundle reload transport
- [`@deepseek-ai/dsh-client-locale`](locale/README.zh.md) — Locale plugin: Host-backed preference, extensible language catalog, browser fallback, and typed built-in dictionaries
- [`@deepseek-ai/dsh-client-modules`](modules/README.zh.md) — Client module system, dual-face: node half composes the __DSH_BOOT__ entry graph (incremental dsh.client scan, bundle route, index tap, webPlugins service); Desktop renderer is the lazy-CJS module table the vendored cordis Loader consumes as its internal seam
- [`@deepseek-ai/dsh-client-product-analytics`](product-analytics/README.zh.md) — Desktop product event collection and authenticated Host reporting
- [`@deepseek-ai/dsh-client-resources`](resources/README.zh.md) — Unified client resource model: protocol-registered providers turn URL addresses into live values, consumed through the useResource global standard hook
- [`@deepseek-ai/dsh-client-shortcuts`](shortcuts/README.zh.md) — Application keyboard command registry and physical-key routing
- [`@deepseek-ai/dsh-client-store`](store/README.zh.md) — React-free observable and snapshot-store contracts with the shared Zustand/Immer engine
- [`@deepseek-ai/dsh-client-ui-agent-preset`](ui-agent-preset/README.zh.md) — Agent-preset surfaces: the default for later sessions, this session's seat, and the composition editor
- [`@deepseek-ai/dsh-client-ui-approval`](ui-approval/README.zh.md) — Approval composer takeover over the scoped Remote Event waterfall
- [`@deepseek-ai/dsh-client-ui-attachment`](ui-attachment/README.zh.md) — Dynamic attachment presentation plugin for conversation input, message-image, and trajectory image slots
- [`@deepseek-ai/dsh-client-ui-brand-official`](ui-brand-official/README.zh.md) — Official Aeoth Agent brand occupants for the Desktop client's sidebar slots
- [`@deepseek-ai/dsh-client-ui-chat`](ui-chat/README.zh.md) — Chat Conversation target, node definitions, renderers, and details surface
- [`@deepseek-ai/dsh-client-ui-commands`](ui-commands/README.zh.md) — Client command surface: global directory cache, '/' source, three command UI kinds, popupSelect registry
- [`@deepseek-ai/dsh-client-ui-conversation`](ui-conversation/README.zh.md) — Target-neutral Conversation assembly, shell, composer, queue, and view navigation
- [`@deepseek-ai/dsh-client-ui-deliverables`](ui-deliverables/README.zh.md) — Changed-files card with per-file comparison tabs, delivery cards, and clickable final-response file references for Web
- [`@deepseek-ai/dsh-client-ui-directory-picker-browse`](ui-directory-picker-browse/README.zh.md) — In-app directory browsing surface: the workspace directory-flow owner rendering the host's listing and creation primitives
- [`@deepseek-ai/dsh-client-ui-directory-picker-native`](ui-directory-picker-native/README.zh.md) — Native directory-picker surface: the renderless workspace directory-flow occupant driving the local Desktop or Host OS chooser
- [`@deepseek-ai/dsh-client-ui-dockkit`](ui-dockkit/README.zh.md) — Docking layout kit: split-tree engine with invertible operations, and the React components that render and drive it (zero cordis)
- [`@deepseek-ai/dsh-client-ui-goal`](ui-goal/README.zh.md) — Session goal surface: GoalBar docked above the composer, read from the goal session projection
- [`@deepseek-ai/dsh-client-ui-input-trigger`](ui-input-trigger/README.zh.md) — Input trigger pipeline: '/' and '@' detection, candidate menu, pick routing to registered sources
- [`@deepseek-ai/dsh-client-ui-jobs`](ui-jobs/README.zh.md) — Session-header background-job list with on-demand streaming record panels
- [`@deepseek-ai/dsh-client-ui-layout`](ui-layout/README.zh.md) — Shell plugin: three-column AppFrame with drag handles, ctx.layout viewing-state service (navigation + panels)
- [`@deepseek-ai/dsh-client-ui-message-feedback`](ui-message-feedback/README.zh.md) — The Web feedback surface: per-message Like/Dislike in the assistant-message action strip and the feedback dialog behind both ratings and /feedback, backed by the messageFeedback and sessionFeedback Host Remotes
- [`@deepseek-ai/dsh-client-ui-model-selection`](ui-model-selection/README.zh.md) — Model selection over the shared model catalog, Session projection, and session.selectModel
- [`@deepseek-ai/dsh-client-ui-open-in-app`](ui-open-in-app/README.zh.md) — Web "Open In..." controls: the Session-header split button opening the workspace directory in an installed application, and the document preview's default-application controls for one file
- [`@deepseek-ai/dsh-client-ui-permission-presets`](ui-permission-presets/README.zh.md) — Permission surfaces: a new-session default in General settings and a current-session /permission popup over the permissions projection
- [`@deepseek-ai/dsh-client-ui-plan`](ui-plan/README.zh.md) — Plan mode controls, persistent transcript plan cards, and sidebar Markdown previews
- [`@deepseek-ai/dsh-client-ui-plugin-manager`](ui-plugin-manager/README.zh.md) — Plugin management for the aeoth web client: the sidebar Plugins panel installs, enables, disables, retries, and composes installed plugin packages
- [`@deepseek-ai/dsh-client-ui-primitives`](ui-primitives/README.zh.md) — Pure React atoms for the aeoth web UI: controls, icons, markdown, and JSON inspectors (zero cordis)
- [`@deepseek-ai/dsh-client-ui-reference`](ui-reference/README.zh.md) — Unified Web @file and @session reference source
- [`@deepseek-ai/dsh-client-ui-renderer`](ui-renderer/README.zh.md) — Browser UI renderer: React slot bindings, ctx.uiRenderer, and the assembled application root
- [`@deepseek-ai/dsh-client-ui-schedule`](ui-schedule/README.zh.md) — Host task management page and Session reminder catalog
- [`@deepseek-ai/dsh-client-ui-session`](ui-session/README.zh.md) — Session Controller adapter for React and session-scoped slots
- [`@deepseek-ai/dsh-client-ui-settings`](ui-settings/README.zh.md) — Settings domain base plugin: shared configuration forms and the canonical settings slot-type contract
- [`@deepseek-ai/dsh-client-ui-settings-account`](ui-settings-account/README.zh.md) — Manage DeepSeek login and open Platform billing pages
- [`@deepseek-ai/dsh-client-ui-settings-agent-loop`](ui-settings-agent-loop/README.zh.md) — Settings page of the agent loop on the dsh web client's Plugins page: the parallel tool-call cap of the agent-loop namespace
- [`@deepseek-ai/dsh-client-ui-settings-general`](ui-settings-general/README.zh.md) — Settings ownerless-copy and product onboarding plugin: the General section, shell trigger/header chrome content, settings dictionaries, and the versioned welcome notice
- [`@deepseek-ai/dsh-client-ui-settings-memory`](ui-settings-memory/README.zh.md) — Desktop runtime MEMORY, USER, and skill management settings page
- [`@deepseek-ai/dsh-client-ui-settings-models`](ui-settings-models/README.zh.md) — Models settings and shared product-onboarding dialogs over existing settings and credential joins
- [`@deepseek-ai/dsh-client-ui-settings-plugin-inventory`](ui-settings-plugin-inventory/README.zh.md) — Read-only Cordis Loader inventory tab in Web Plugins settings
- [`@deepseek-ai/dsh-client-ui-settings-plugins`](ui-settings-plugins/README.zh.md) — Built-in plugins settings section for the dsh web client: the Settings navigation entry and the tab chrome feature-owned tabs register into
- [`@deepseek-ai/dsh-client-ui-settings-session-log`](ui-settings-session-log/README.zh.md) — General settings control for Session-log upload with DeepSeek API requests
- [`@deepseek-ai/dsh-client-ui-settings-shell`](ui-settings-shell/README.zh.md) — Settings page of the shell executor on the dsh web client's Plugins page: the command timeout and the per-stream output cap of the shell namespace
- [`@deepseek-ai/dsh-client-ui-settings-subagent`](ui-settings-subagent/README.zh.md) — Settings page of Subagent delegation on the dsh web client's Plugins page: recursion depth, parallel capacity, and the models agents may choose for subagents
- [`@deepseek-ai/dsh-client-ui-settings-web-search`](ui-settings-web-search/README.zh.md) — Settings page of the DeepSeek web-search provider on the dsh web client's Plugins page: its API key, endpoint, and per-request search budget
- [`@deepseek-ai/dsh-client-ui-shortcuts`](ui-shortcuts/README.zh.md) — Keyboard shortcut reference, recording, and local preference editing
- [`@deepseek-ai/dsh-client-ui-sidebar`](ui-sidebar/README.zh.md) — Sidebar plugin: session multi-level tree, search, grouping, state dots
- [`@deepseek-ai/dsh-client-ui-sidebar-browser`](ui-sidebar-browser/README.zh.md) — Sandboxed Web browser tabs for the right Sidebar
- [`@deepseek-ai/dsh-client-ui-sidebar-documentpreview`](ui-sidebar-documentpreview/README.zh.md) — Extensible Sidebar previews for Office documents, spreadsheets, Markdown, code, images, PDF, HTML, and plain text
- [`@deepseek-ai/dsh-client-ui-sidebar-files`](ui-sidebar-files/README.zh.md) — Workspace file tree tab type for the right Sidebar: lazy directory listing over the workspaceFiles Remote namespace, opening files into the Sidebar
- [`@deepseek-ai/dsh-client-ui-sidebar-right`](ui-sidebar-right/README.zh.md) — Right Sidebar: the docking surface's session-bound state, its panel and header expand control, and the navigation service over it
- [`@deepseek-ai/dsh-client-ui-sidebar-terminal`](ui-sidebar-terminal/README.zh.md) — Interactive shell tabs for the right Sidebar
- [`@deepseek-ai/dsh-client-ui-skill`](ui-skill/README.zh.md) — Web skill references and the dedicated skill tool row
- [`@deepseek-ai/dsh-client-ui-slots`](ui-slots/README.zh.md) — Slot registry pure core: typed ordinary Slots and reusable Component Factories, derived props, Store seats, and renderer installation
- [`@deepseek-ai/dsh-client-ui-subagent`](ui-subagent/README.zh.md) — Subagent conversation catalog, continuation routing UI, and '@' reference source
- [`@deepseek-ai/dsh-client-ui-theme`](ui-theme/README.zh.md) — Theme plugin: Host bootstrap for the pre-plugin palette; DOM-free ThemeRuntime for light/dark/system state; --dsw-* token styles and Appearance settings row
- [`@deepseek-ai/dsh-client-ui-tool`](ui-tool/README.zh.md) — Client Tool call-tree renderer and keyed per-tool presentation slot
- [`@deepseek-ai/dsh-client-ui-trajectory`](ui-trajectory/README.zh.md) — Trajectory event ledger with an interactive timing overview: pure-consumer plugin registering into the conversation ViewMap (no service)
- [`@deepseek-ai/dsh-client-ui-user-questions`](ui-user-questions/README.zh.md) — Web ask_user_question composer takeover and plan-review presentation UI
- [`@deepseek-ai/dsh-client-ui-workflow-run`](ui-workflow-run/README.zh.md) — Durable workflow-run Conversation Node and nested member disclosure for aeoth web
- [`@deepseek-ai/dsh-client-ui-workspace`](ui-workspace/README.zh.md) — Workspace picker plugin: one WorkspacePicker registered into the sidebar and empty-state workspace slots

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
