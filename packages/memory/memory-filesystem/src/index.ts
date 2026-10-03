/** Native profile-scoped MEMORY.md / USER.md provider. */

import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { resolveAeothHome } from '@deepseek-ai/dsh-home-paths'
import type { MemoryDocument, MemoryProvider, MemoryRequestContext, MemorySource, MemoryTarget } from '@deepseek-ai/dsh-memory'
import type { MemoryRuntime } from '@deepseek-ai/dsh-memory'
import z from '@deepseek-ai/schemastery'

export const name = 'memory-filesystem'
export const inject = ['memories']

export interface Config {
  /** Override the profile-scoped directory. Defaults to <profile>/memories. */
  readonly root?: string
  /** Provider id exposed to the memory registry. */
  readonly providerName?: string
}

export const Config: z<Config> = z.object({
  root: z.string(),
  providerName: z.string().min(1).default('filesystem'),
})

const FILES: Record<MemoryTarget, string> = {
  memory: 'MEMORY.md',
  user: 'USER.md',
}

interface StoredSource {
  readonly source?: MemorySource
}

class FileSystemMemoryProvider implements MemoryProvider {
  constructor(
    readonly name: string,
    private readonly root: string,
  ) {}

  async load(target: MemoryTarget, context?: MemoryRequestContext): Promise<MemoryDocument> {
    const root = this.rootFor(context)
    const filename = join(root, FILES[target])
    let content: string
    try {
      content = await readFile(filename, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { target, entries: [] }
      throw error
    }
    const texts = parseEntries(content)
    const sources = await readSources(join(root, sourceFile(FILES[target])))
    return {
      target,
      entries: texts.map((text, index) => ({
        text,
        ...(sources?.length === texts.length && sources[index]?.source !== undefined
          ? { source: sources[index].source }
          : {}),
      })),
    }
  }

  async save(document: MemoryDocument, context?: MemoryRequestContext): Promise<void> {
    const root = this.rootFor(context)
    const filename = join(root, FILES[document.target])
    const content = document.entries.length === 0 ? '' : `${document.entries.map(entry => entry.text).join('\n§\n')}\n`
    await writeFileAtomic(filename, content, { mode: 0o600, dirMode: 0o700 })
    const sources: StoredSource[] = document.entries.map(entry => ({
      ...(entry.source === undefined ? {} : { source: entry.source }),
    }))
    await writeFileAtomic(join(root, sourceFile(FILES[document.target])), JSON.stringify(sources, null, 2) + '\n', { mode: 0o600, dirMode: 0o700 })
  }

  private rootFor(context: MemoryRequestContext | undefined): string {
    if (context?.namespace === undefined) return this.root
    const key = createHash('sha256').update(context.namespace).digest('hex').slice(0, 32)
    return join(this.root, 'agents', key)
  }
}

/** Register the native provider and prime both prompt snapshots before the agent starts. */
export async function apply(ctx: Context, config: Config = {}): Promise<void> {
  const profile = ctx.get('profileContext') as { dir?: string } | undefined
  const root = resolve(config.root ?? join(profile?.dir ?? resolveAeothHome(), 'memories'))
  const providerName = config.providerName ?? 'filesystem'
  const provider = new FileSystemMemoryProvider(providerName, root)
  const memories = ctx.get('memories') as MemoryRuntime
  const unregister = memories.registerProvider(provider)
  try {
    if (memories.providerName === providerName) await memories.refresh()
  } catch (error) {
    await unregister()
    throw new Error(`failed to load native long-term memory from ${root}: ${String(error)}`, { cause: error })
  }
  ctx.effect(() => unregister, 'memory-filesystem provider')
}

function sourceFile(memoryFile: string): string {
  return memoryFile.replace(/\.md$/u, '.meta.json')
}

async function readSources(filename: string): Promise<readonly StoredSource[] | undefined> {
  try {
    const parsed: unknown = JSON.parse(await readFile(filename, 'utf8'))
    if (!Array.isArray(parsed)) return undefined
    return parsed as StoredSource[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    return undefined
  }
}

function parseEntries(content: string): string[] {
  return content
    .replace(/^\uFEFF/u, '')
    .split(/\n§\n/u)
    .map(entry => entry.trim())
    .filter(Boolean)
}
