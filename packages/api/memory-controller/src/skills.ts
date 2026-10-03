/** Only profile-owned SKILL.md files are writable; provider/bundled skills remain read-only. */
import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, unlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { isMap, parse, parseDocument } from 'yaml'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { isSkillName } from '@deepseek-ai/dsh-skill'
import type { MemorySkillValue } from './types.ts'

const MAX_BYTES = 128 * 1024
export class ManagedSkills {
  private tail: Promise<unknown> = Promise.resolve()
  constructor(readonly root: string) {}
  path(name: string): string {
    if (!isSkillName(name)) throw new Error('Use a lowercase kebab-case skill name.')
    return join(this.root, name, 'SKILL.md')
  }
  private async guard(name: string, create = false): Promise<void> {
    this.path(name)
    for (const path of [this.root, join(this.root, name), this.path(name)]) {
      try {
        const stat = await lstat(path)
        if (stat.isSymbolicLink() || (path === this.path(name) ? !stat.isFile() : !stat.isDirectory())) {
          throw new Error('Managed skills cannot follow symbolic links or non-regular paths.')
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    }
    if (create) await mkdir(join(this.root, name), { recursive: true, mode: 0o700 })
  }
  async read(name: string): Promise<MemorySkillValue | undefined> {
    await this.guard(name)
    let text: string
    try {
      if ((await lstat(this.path(name))).size > MAX_BYTES) throw new Error('Skill file exceeds 128 KiB.')
      text = await readFile(this.path(name), 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
      throw error
    }
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/u.exec(text)
    if (match === null) throw new Error(`Skill ${name} requires YAML frontmatter.`)
    const data = parse(match[1]!) as Record<string, unknown> | null
    if (!data || data.name !== name || typeof data.description !== 'string') throw new Error(`Invalid skill metadata: ${name}`)
    return {
      name, description: data.description, content: match[2]!.trim(), source: 'user', path: this.path(name),
      modelInvocable: data['disable-model-invocation'] !== true, userInvocable: data['user-invocable'] !== false,
      writable: true, revision: createHash('sha256').update(text).digest('hex'),
    }
  }
  async list(): Promise<MemorySkillValue[]> {
    let entries
    try { entries = await readdir(this.root, { withFileTypes: true }) }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error }
    const skills: MemorySkillValue[] = []
    for (const entry of entries) {
      if (!entry.isDirectory() || !isSkillName(entry.name)) continue
      const skill = await this.read(entry.name)
      if (skill !== undefined) skills.push(skill)
    }
    return skills
  }
  save(name: string, description: string, content: string, expectedRevision: string | null): Promise<MemorySkillValue> {
    return this.serial(async () => {
      if (!description.trim() || !content.trim()) throw new Error('Description and instructions are required.')
      const current = await this.read(name)
      if ((current?.revision ?? null) !== expectedRevision) throw new Error('Skill changed or already exists. Refresh before saving.')
      const previous = current === undefined ? undefined : await readFile(this.path(name), 'utf8')
      const metadata = parseDocument(previous?.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u)?.[1] ?? '{}')
      if (metadata.errors.length || !isMap(metadata.contents)) throw new Error('Invalid skill metadata.')
      metadata.set('name', name)
      metadata.set('description', description.trim())
      const text = `---\n${String(metadata)}---\n\n${content.trim()}\n`
      if (Buffer.byteLength(text) > MAX_BYTES) throw new Error('Skill file exceeds 128 KiB.')
      await this.guard(name, true)
      await writeFileAtomic(this.path(name), text, { mode: 0o600, dirMode: 0o700 })
      return (await this.read(name))!
    })
  }
  remove(name: string, expectedRevision: string): Promise<void> {
    return this.serial(async () => {
      const current = await this.read(name)
      if (!current || current.revision !== expectedRevision) throw new Error('Skill changed or was removed. Refresh before deleting.')
      await unlink(this.path(name)) // Never delete support files, directories, or third-party content.
    })
  }
  private serial<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.tail.then(async () => {
      try {
        const stat = await lstat(this.root)
        if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('Invalid managed skill root.')
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      await mkdir(this.root, { recursive: true, mode: 0o700 })
      return withFileLock(join(this.root, '.managed-write'), async () => {
        const directory = join(this.root, '.curator')
        const file = join(directory, 'curator.json')
        try {
          for (const path of [directory, file]) {
            const stat = await lstat(path)
            if (stat.isSymbolicLink() || (path === file ? !stat.isFile() : !stat.isDirectory())) throw new Error('Invalid curator state path.')
          }
          const state = JSON.parse(await readFile(file, 'utf8')) as { transaction?: unknown }
          if (state.transaction !== undefined) throw new Error('Recover the interrupted skill review before editing.')
        } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
        return operation()
      }, { waitMs: 10_000 })
    })
    this.tail = next.catch(() => {})
    return next
  }
}
