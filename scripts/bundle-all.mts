/**
 * Bundle all workspace packages in small batches to avoid OOM on 8 GB machines.
 * Runs tsdown from the repo root each time (so cross-package lib/types paths resolve
 * correctly), but passes a restricted workspace glob so each rolldown invocation
 * only loads ~20-30 packages at once.
 */
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { writeFileSync, unlinkSync } from 'node:fs'

const ROOT = resolve(import.meta.dirname, '..')
const TSDOWN = resolve(ROOT, 'node_modules/tsdown/dist/run.mjs')
const NODE = process.execPath
const BATCH_CONFIG = resolve(ROOT, 'tsdown.batch.config.mts')

// Batches: each is a list of workspace globs for one rolldown invocation.
// Keep each batch small (< 30 packages) to stay within 8 GB.
const BATCHES: string[][] = [
  // Batch 1: vendor packages (foundational, needed by everything else)
  ['vendor/*'],
  // Batch 2: util + runtime-diagnostics + typert (low-level, no UI deps)
  ['packages/util/*', 'packages/runtime-diagnostics/*', 'packages/typert/*'],
  // Batch 3: storage + credentials + llm + identity
  ['packages/storage/*', 'packages/credentials/*', 'packages/llm/*', 'packages/identity/*'],
  // Batch 4: core packages (session, agent, scope)
  ['packages/core/*', 'packages/session/*', 'packages/session-query/*'],
  // Batch 5: sandbox + fs + subprocess + shell + ssh
  ['packages/sandbox/*', 'packages/fs/*', 'packages/subprocess/*', 'packages/shell/*', 'packages/ssh/*'],
  // Batch 6: api packages
  ['packages/api/*'],
  // Batch 7: host + boot + desktop runtime
  ['packages/host/*', 'packages/boot/*', 'packages/desktop/runtime'],
  // Batch 8: interaction + context + workspace + jobs + plan + schedule
  ['packages/interaction/*', 'packages/context/*', 'packages/workspace/*', 'packages/jobs/*', 'packages/plan/*', 'packages/schedule/*'],
  // Batch 9: compaction + feedback + goal + skill + memory + web
  ['packages/compaction/*', 'packages/feedback/*', 'packages/goal/*', 'packages/skill/*', 'packages/memory/*', 'packages/web/*'],
  // Batch 10: extensions + browser + computer + ptc + subagent + workflow + mcp
  ['packages/extensions/*', 'packages/browser-use/*', 'packages/computer-use/*', 'packages/ptc-runtime/*', 'packages/subagent/*', 'packages/workflow/*', 'packages/mcp/*'],
  // Batch 11: attachment + deliverables + document + hooks + lsp + settings + preset + todo
  ['packages/attachment/*', 'packages/deliverables/*', 'packages/document/*', 'packages/hooks/*', 'packages/lsp/*', 'packages/settings/*', 'packages/preset/*', 'packages/todo/*', 'packages/terminal/*', 'packages/telemetry/*'],
  // Batch 12: client packages (split for memory) part 1
  ['packages/client/connection', 'packages/client/desktop', 'packages/client/file-upload',
   'packages/client/hmr', 'packages/client/locale', 'packages/client/modules',
   'packages/client/product-analytics', 'packages/client/resources', 'packages/client/shortcuts',
   'packages/client/store', 'packages/client/ui-primitives', 'packages/client/ui-slots'],
  // Batch 13: client UI packages part 1
  ['packages/client/ui-agent-preset', 'packages/client/ui-approval',
   'packages/client/ui-attachment', 'packages/client/ui-brand-official', 'packages/client/ui-chat',
   'packages/client/ui-commands', 'packages/client/ui-conversation', 'packages/client/ui-deliverables',
   'packages/client/ui-directory-picker-browse', 'packages/client/ui-directory-picker-native'],
  // Batch 14: client UI packages part 2
  ['packages/client/ui-dockkit', 'packages/client/ui-goal', 'packages/client/ui-input-trigger',
   'packages/client/ui-jobs', 'packages/client/ui-layout', 'packages/client/ui-message-feedback',
   'packages/client/ui-model-selection', 'packages/client/ui-open-in-app', 'packages/client/ui-permission-presets',
   'packages/client/ui-plan', 'packages/client/ui-plugin-manager', 'packages/client/ui-reference'],
  // Batch 15: client UI packages part 3
  ['packages/client/ui-renderer', 'packages/client/ui-schedule', 'packages/client/ui-session',
   'packages/client/ui-settings', 'packages/client/ui-settings-account', 'packages/client/ui-settings-agent-loop',
   'packages/client/ui-settings-general', 'packages/client/ui-settings-memory', 'packages/client/ui-settings-models'],
  // Batch 16: client UI packages part 4
  ['packages/client/ui-settings-plugin-inventory', 'packages/client/ui-settings-plugins',
   'packages/client/ui-settings-session-log', 'packages/client/ui-settings-shell',
   'packages/client/ui-settings-subagent', 'packages/client/ui-settings-web-search',
   'packages/client/ui-shortcuts', 'packages/client/ui-sidebar', 'packages/client/ui-sidebar-browser',
   'packages/client/ui-sidebar-documentpreview', 'packages/client/ui-sidebar-files'],
  // Batch 17: client UI packages part 5
  ['packages/client/ui-sidebar-right', 'packages/client/ui-sidebar-terminal', 'packages/client/ui-skill',
   'packages/client/ui-slots', 'packages/client/ui-subagent', 'packages/client/ui-theme',
   'packages/client/ui-tool', 'packages/client/ui-trajectory', 'packages/client/ui-user-questions',
   'packages/client/ui-workflow-run', 'packages/client/ui-workspace'],
  // Batch 18: experimental + desktop-host + tool
  ['packages/experimental/*', 'packages/tool/*', 'apps/desktop-host'],
]

function runBatch(batchIndex: number, globs: string[]): boolean {
  // Write a temporary tsdown config that only processes this batch
  const workspace = JSON.stringify([...globs, '!packages/desktop/frontend'])
  const src = `
import { defineConfig } from 'tsdown'
import { typertPlugin } from './packages/typert/generator/lib/types/tsdown-plugin.js'
export default defineConfig({
  workspace: ${workspace},
  entry: ['lib/types/{index,invariant,startup}.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
  plugins: [typertPlugin({ mode: 'workspace', faces: ['host'] })],
})
`
  writeFileSync(BATCH_CONFIG, src, 'utf8')

  console.log(`\nBatch ${batchIndex + 1}/${BATCHES.length}: ${globs.join(', ')}`)
  const result = spawnSync(NODE, [TSDOWN, '--config', BATCH_CONFIG, '--env.DSH_BUILD_FACE', 'host'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, DSH_BUILD_FACE: 'host' },
  })
  return result.status === 0
}

let totalOk = 0
let totalFail = 0
const failedBatches: number[] = []

for (let i = 0; i < BATCHES.length; i++) {
  if (runBatch(i, BATCHES[i])) {
    totalOk++
  } else {
    totalFail++
    failedBatches.push(i + 1)
  }
}

// Clean up temp config
try { unlinkSync(BATCH_CONFIG) } catch {}

console.log(`\n========= Done: ${totalOk} batches succeeded, ${totalFail} failed =========`)
if (failedBatches.length > 0) {
  console.log(`Failed batches: ${failedBatches.join(', ')}`)
  process.exit(1)
}
