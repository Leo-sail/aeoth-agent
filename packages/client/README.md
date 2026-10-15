---
description: "Desktop renderer services, controls and feature panels."
kind: "package-group"
---

# packages/client

English | [中文](README.zh.md)

## Overview

Desktop renderer services, controls and feature panels. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-client-connection`](connection/README.md) — Authenticated RPC transport and generation lifecycle
- [`@deepseek-ai/dsh-client-desktop`](desktop/README.md) — Web boot kernel: static module table, Cordis loader, framework-free boot page, and UI-renderer handoff
- [`@deepseek-ai/dsh-client-file-upload`](file-upload/README.md) — Agent-scoped browser file upload, streaming intake, and staged receipt service
- [`@deepseek-ai/dsh-client-hmr`](hmr/README.md) — Desktop client graph synchronization and rebuilt-bundle reload transport
- [`@deepseek-ai/dsh-client-locale`](locale/README.md) — Locale plugin: Host-backed preference, extensible language catalog, browser fallback, and typed built-in dictionaries
- [`@deepseek-ai/dsh-client-modules`](modules/README.md) — Client module system, dual-face: node half composes the __DSH_BOOT__ entry graph (incremental dsh.client scan, bundle route, index tap, webPlugins service); Desktop renderer is the lazy-CJS module table the vendored cordis Loader consumes as its internal seam
- [`@deepseek-ai/dsh-client-product-analytics`](product-analytics/README.md) — Desktop product event collection and authenticated Host reporting
- [`@deepseek-ai/dsh-client-resources`](resources/README.md) — Unified client resource model: protocol-registered providers turn URL addresses into live values, consumed through the useResource global standard hook
- [`@deepseek-ai/dsh-client-shortcuts`](shortcuts/README.md) — Application keyboard command registry and physical-key routing
- [`@deepseek-ai/dsh-client-store`](store/README.md) — React-free observable and snapshot-store contracts with the shared Zustand/Immer engine
- [`@deepseek-ai/dsh-client-ui-agent-preset`](ui-agent-preset/README.md) — Agent-preset surfaces: the default for later sessions, this session's seat, and the composition editor
- [`@deepseek-ai/dsh-client-ui-approval`](ui-approval/README.md) — Approval composer takeover over the scoped Remote Event waterfall
- [`@deepseek-ai/dsh-client-ui-attachment`](ui-attachment/README.md) — Dynamic attachment presentation plugin for conversation input, message-image, and trajectory image slots
- [`@deepseek-ai/dsh-client-ui-brand-official`](ui-brand-official/README.md) — Official Aeoth Agent brand occupants for the Desktop client's sidebar slots
- [`@deepseek-ai/dsh-client-ui-chat`](ui-chat/README.md) — Chat Conversation target, node definitions, renderers, and details surface
- [`@deepseek-ai/dsh-client-ui-commands`](ui-commands/README.md) — Client command surface: global directory cache, '/' source, three command UI kinds, popupSelect registry
- [`@deepseek-ai/dsh-client-ui-conversation`](ui-conversation/README.md) — Target-neutral Conversation assembly, shell, composer, queue, and view navigation
- [`@deepseek-ai/dsh-client-ui-deliverables`](ui-deliverables/README.md) — Changed-files card with per-file comparison tabs, delivery cards, and clickable final-response file references for Web
- [`@deepseek-ai/dsh-client-ui-directory-picker-browse`](ui-directory-picker-browse/README.md) — In-app directory browsing surface: the workspace directory-flow owner rendering the host's listing and creation primitives
- [`@deepseek-ai/dsh-client-ui-directory-picker-native`](ui-directory-picker-native/README.md) — Native directory-picker surface: the renderless workspace directory-flow occupant driving the local Desktop or Host OS chooser
- [`@deepseek-ai/dsh-client-ui-dockkit`](ui-dockkit/README.md) — Docking layout kit: split-tree engine with invertible operations, and the React components that render and drive it (zero cordis)
- [`@deepseek-ai/dsh-client-ui-goal`](ui-goal/README.md) — Session goal surface: GoalBar docked above the composer, read from the goal session projection
- [`@deepseek-ai/dsh-client-ui-input-trigger`](ui-input-trigger/README.md) — Input trigger pipeline: '/' and '@' detection, candidate menu, pick routing to registered sources
- [`@deepseek-ai/dsh-client-ui-jobs`](ui-jobs/README.md) — Session-header background-job list with on-demand streaming record panels
- [`@deepseek-ai/dsh-client-ui-layout`](ui-layout/README.md) — Shell plugin: three-column AppFrame with drag handles, ctx.layout viewing-state service (navigation + panels)
- [`@deepseek-ai/dsh-client-ui-message-feedback`](ui-message-feedback/README.md) — The Web feedback surface: per-message Like/Dislike in the assistant-message action strip and the feedback dialog behind both ratings and /feedback, backed by the messageFeedback and sessionFeedback Host Remotes
- [`@deepseek-ai/dsh-client-ui-model-selection`](ui-model-selection/README.md) — Model selection over the shared model catalog, Session projection, and session.selectModel
- [`@deepseek-ai/dsh-client-ui-open-in-app`](ui-open-in-app/README.md) — Web "Open In..." controls: the Session-header split button opening the workspace directory in an installed application, and the document preview's default-application controls for one file
- [`@deepseek-ai/dsh-client-ui-permission-presets`](ui-permission-presets/README.md) — Permission surfaces: a new-session default in General settings and a current-session /permission popup over the permissions projection
- [`@deepseek-ai/dsh-client-ui-plan`](ui-plan/README.md) — Plan mode controls, persistent transcript plan cards, and sidebar Markdown previews
- [`@deepseek-ai/dsh-client-ui-plugin-manager`](ui-plugin-manager/README.md) — Plugin management for the Aeoth Desktop renderer: the sidebar Plugins panel installs, enables, disables, retries, and composes installed plugin packages
- [`@deepseek-ai/dsh-client-ui-primitives`](ui-primitives/README.md) — Pure React atoms for the Aeoth Desktop UI: controls, icons, markdown, and JSON inspectors (zero cordis)
- [`@deepseek-ai/dsh-client-ui-reference`](ui-reference/README.md) — Unified Web @file and @session reference source
- [`@deepseek-ai/dsh-client-ui-renderer`](ui-renderer/README.md) — Browser UI renderer: React slot bindings, ctx.uiRenderer, and the assembled application root
- [`@deepseek-ai/dsh-client-ui-schedule`](ui-schedule/README.md) — Host task management page and Session reminder catalog
- [`@deepseek-ai/dsh-client-ui-session`](ui-session/README.md) — Session Controller adapter for React and session-scoped slots
- [`@deepseek-ai/dsh-client-ui-settings`](ui-settings/README.md) — Settings domain base plugin: shared configuration forms and the canonical settings slot-type contract
- [`@deepseek-ai/dsh-client-ui-settings-account`](ui-settings-account/README.md) — Manage DeepSeek login and open Platform billing pages
- [`@deepseek-ai/dsh-client-ui-settings-agent-loop`](ui-settings-agent-loop/README.md) — Settings page of the agent loop in Desktop Settings: the parallel tool-call cap of the agent-loop namespace
- [`@deepseek-ai/dsh-client-ui-settings-general`](ui-settings-general/README.md) — Settings ownerless-copy and product onboarding plugin: the General section, shell trigger/header chrome content, settings dictionaries, and the versioned welcome notice
- [`@deepseek-ai/dsh-client-ui-settings-memory`](ui-settings-memory/README.md) — Desktop runtime MEMORY, USER, and skill management settings page
- [`@deepseek-ai/dsh-client-ui-settings-models`](ui-settings-models/README.md) — Models settings and shared product-onboarding dialogs over existing settings and credential joins
- [`@deepseek-ai/dsh-client-ui-settings-plugin-inventory`](ui-settings-plugin-inventory/README.md) — Read-only Cordis Loader inventory tab in Web Plugins settings
- [`@deepseek-ai/dsh-client-ui-settings-plugins`](ui-settings-plugins/README.md) — Built-in plugins settings section for Desktop Settings: the Settings navigation entry and the tab chrome feature-owned tabs register into
- [`@deepseek-ai/dsh-client-ui-settings-session-log`](ui-settings-session-log/README.md) — General settings control for Session-log upload with DeepSeek API requests
- [`@deepseek-ai/dsh-client-ui-settings-shell`](ui-settings-shell/README.md) — Settings page of the shell executor in Desktop Settings: the command timeout and the per-stream output cap of the shell namespace
- [`@deepseek-ai/dsh-client-ui-settings-subagent`](ui-settings-subagent/README.md) — Settings page of Subagent delegation in Desktop Settings: recursion depth, parallel capacity, and the models agents may choose for subagents
- [`@deepseek-ai/dsh-client-ui-settings-web-search`](ui-settings-web-search/README.md) — Settings page of the DeepSeek web-search provider in Desktop Settings: its API key, endpoint, and per-request search budget
- [`@deepseek-ai/dsh-client-ui-shortcuts`](ui-shortcuts/README.md) — Keyboard shortcut reference, recording, and local preference editing
- [`@deepseek-ai/dsh-client-ui-sidebar`](ui-sidebar/README.md) — Sidebar plugin: session multi-level tree, search, grouping, state dots
- [`@deepseek-ai/dsh-client-ui-sidebar-browser`](ui-sidebar-browser/README.md) — Sandboxed Web browser tabs for the right Sidebar
- [`@deepseek-ai/dsh-client-ui-sidebar-documentpreview`](ui-sidebar-documentpreview/README.md) — Extensible Sidebar previews for Office documents, spreadsheets, Markdown, code, images, PDF, HTML, and plain text
- [`@deepseek-ai/dsh-client-ui-sidebar-files`](ui-sidebar-files/README.md) — Workspace file tree tab type for the right Sidebar: lazy directory listing over the workspaceFiles Remote namespace, opening files into the Sidebar
- [`@deepseek-ai/dsh-client-ui-sidebar-right`](ui-sidebar-right/README.md) — Right Sidebar: the docking surface's session-bound state, its panel and header expand control, and the navigation service over it
- [`@deepseek-ai/dsh-client-ui-sidebar-terminal`](ui-sidebar-terminal/README.md) — Interactive shell tabs for the right Sidebar
- [`@deepseek-ai/dsh-client-ui-skill`](ui-skill/README.md) — Web skill references and the dedicated skill tool row
- [`@deepseek-ai/dsh-client-ui-slots`](ui-slots/README.md) — Slot registry pure core: typed ordinary Slots and reusable Component Factories, derived props, Store seats, and renderer installation
- [`@deepseek-ai/dsh-client-ui-subagent`](ui-subagent/README.md) — Subagent conversation catalog, continuation routing UI, and '@' reference source
- [`@deepseek-ai/dsh-client-ui-theme`](ui-theme/README.md) — Theme plugin: Host bootstrap for the pre-plugin palette; DOM-free ThemeRuntime for light/dark/system state; --dsw-* token styles and Appearance settings row
- [`@deepseek-ai/dsh-client-ui-tool`](ui-tool/README.md) — Client Tool call-tree renderer and keyed per-tool presentation slot
- [`@deepseek-ai/dsh-client-ui-trajectory`](ui-trajectory/README.md) — Trajectory event ledger with an interactive timing overview: pure-consumer plugin registering into the conversation ViewMap (no service)
- [`@deepseek-ai/dsh-client-ui-user-questions`](ui-user-questions/README.md) — Web ask_user_question composer takeover and plan-review presentation UI
- [`@deepseek-ai/dsh-client-ui-workflow-run`](ui-workflow-run/README.md) — Durable workflow-run Conversation Node and nested member disclosure for aeoth web
- [`@deepseek-ai/dsh-client-ui-workspace`](ui-workspace/README.md) — Workspace picker plugin: one WorkspacePicker registered into the sidebar and empty-state workspace slots

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
