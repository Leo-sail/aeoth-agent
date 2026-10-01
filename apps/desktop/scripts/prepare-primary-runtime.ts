/** Desktop resource locations for the shared runtime builder. */

import { readFileSync } from 'node:fs'
import { preparePrimaryRuntime as preparePayload } from '../../../scripts/primary-runtime/prepare.ts'
import { resolveDesktopBuildTarget, resolveDesktopTargetBuildPaths } from './desktop-build-paths.mjs'

/** Prepare Desktop resources for its selected packaging target. */
export async function preparePrimaryRuntime(): Promise<void> {
  const paths = resolveDesktopTargetBuildPaths()
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }
  await preparePayload({ target: resolveDesktopBuildTarget(), output: paths.runtime, cache: paths.downloads, version })
}

if (import.meta.main) await preparePrimaryRuntime()
