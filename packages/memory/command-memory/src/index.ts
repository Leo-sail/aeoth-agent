/** Human-facing /memory command for inspecting and editing durable memory. */

import type { Context } from '@deepseek-ai/cordis'
import { CommandDefinitionId } from '@deepseek-ai/dsh-commands/brand'
import type { CommandInvocation, CommandResult } from '@deepseek-ai/dsh-commands'
import type { MemoryRuntime, MemorySearchHit, MemorySnapshot, MemoryTarget } from '@deepseek-ai/dsh-memory'

export const name = 'command-memory'
export const inject = ['commands', 'memories']

const USAGE = [
  'Usage:',
  '  /memory                         show MEMORY and USER',
  '  /memory search <query>          search both stores',
  '  /memory add <memory|user> <text>',
  '  /memory replace <memory|user> <old text> => <new text>',
  '  /memory remove <memory|user> <old text>',
].join('\n')

interface ParsedMemoryCommand {
  readonly action: 'show' | 'search' | 'add' | 'replace' | 'remove'
  readonly target?: MemoryTarget
  readonly query?: string
  readonly content?: string
  readonly oldText?: string
}

function parseInput(rawInput: string): ParsedMemoryCommand | { error: string } {
  const input = rawInput.trim()
  if (input === '') return { action: 'show' }
  const separator = input.indexOf(' ')
  const verb = (separator < 0 ? input : input.slice(0, separator)).toLowerCase()
  const rest = separator < 0 ? '' : input.slice(separator + 1).trim()
  if (verb === 'show' && rest === '') return { action: 'show' }
  if (verb === 'search' && rest !== '') return { action: 'search', query: rest }
  if (verb === 'add') return parseTargetText('add', rest)
  if (verb === 'remove') return parseTargetText('remove', rest)
  if (verb === 'replace') return parseReplace(rest)
  return { error: USAGE }
}

function parseTargetText(action: 'add' | 'remove', rest: string): ParsedMemoryCommand | { error: string } {
  const match = /^(memory|user)\s+(.+)$/u.exec(rest)
  if (match === null) return { error: USAGE }
  const target = match[1] as MemoryTarget
  const text = match[2]?.trim()
  if (text === undefined || text === '') return { error: USAGE }
  return action === 'add'
    ? { action, target, content: text }
    : { action, target, oldText: text }
}

function parseReplace(rest: string): ParsedMemoryCommand | { error: string } {
  const match = /^(memory|user)\s+(.+?)\s+=>\s+(.+)$/u.exec(rest)
  if (match === null) return { error: USAGE }
  const target = match[1] as MemoryTarget
  const oldText = match[2]?.trim()
  const content = match[3]?.trim()
  if (oldText === undefined || oldText === '' || content === undefined || content === '') return { error: USAGE }
  return { action: 'replace', target, oldText, content }
}

async function execute(ctx: Context, invocation: CommandInvocation): Promise<CommandResult> {
  const parsed = parseInput(invocation.rawInput)
  if ('error' in parsed) return { kind: 'error', text: parsed.error }
  const memories = ctx.get('memories') as MemoryRuntime
  try {
    switch (parsed.action) {
      case 'show': {
        const [memory, user] = await Promise.all([
          memories.read('memory', requestContext(invocation)),
          memories.read('user', requestContext(invocation)),
        ])
        return { kind: 'success', text: `${formatSnapshot(memory)}\n\n${formatSnapshot(user)}` }
      }
      case 'search': {
        const hits = await memories.search(parsed.query ?? '', undefined, undefined, requestContext(invocation))
        return { kind: 'success', text: formatHits(hits) }
      }
      case 'add':
      case 'replace':
      case 'remove': {
        const result = await memories.mutate(
          parsed.target as MemoryTarget,
          parsed.action,
          parsed.content,
          parsed.oldText,
          requestContext(invocation),
        )
        return { kind: 'success', text: `${result.message}\n\n${formatSnapshot(result.snapshot)}` }
      }
      default:
        return { kind: 'error', text: USAGE }
    }
  } catch (error) {
    return { kind: 'error', text: error instanceof Error ? error.message : String(error) }
  }
}

function requestContext(invocation: CommandInvocation) {
  return {
    agentId: invocation.agent.id,
    sessionId: invocation.agent.session.id,
    ...(invocation.agent.session.seq > 0 ? { eventSeq: Number(invocation.agent.session.seq) - 1 } : {}),
    ...(invocation.agent.session.header.cwd === undefined ? {} : { workspace: invocation.agent.session.header.cwd }),
  }
}

function formatSnapshot(snapshot: MemorySnapshot): string {
  const title = snapshot.target === 'memory' ? 'MEMORY' : 'USER'
  const body = snapshot.entries.length === 0
    ? '(empty)'
    : snapshot.entries.map((entry, index) => `${index + 1}. ${entry.text}`).join('\n')
  return `${title} via ${snapshot.provider} [${snapshot.charCount}/${snapshot.charLimit} chars]\n${body}`
}

function formatHits(hits: readonly MemorySearchHit[]): string {
  if (hits.length === 0) return 'No matching long-term memory entries.'
  return hits.map(hit => `[${hit.target} #${hit.index + 1}, score ${hit.score}] ${hit.entry}`).join('\n')
}

export function apply(ctx: Context): void {
  ctx.commands.register({
    definitionId: CommandDefinitionId('@deepseek-ai/dsh-command-memory'),
    name: 'memory',
    description: 'Inspect and edit durable MEMORY and USER entries',
    input: { hint: '[search <query>|add|replace|remove]' },
    handler: invocation => execute(ctx, invocation),
  })
}
