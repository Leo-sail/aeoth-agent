/** API-key authentication and discovery for the official DeepSeek route. */
import type { Context } from '@deepseek-ai/cordis'
import { assertUsableApiKey, LlmError } from '@deepseek-ai/dsh-llm'
import { credentialRefForNamespace } from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import { registerDeepSeekProvider, catalogModelInfo } from '@deepseek-ai/dsh-llm-deepseek'
import { Config, plainOptions, resolveAdapterOptions } from './config.ts'
import type { ResolvedDeepSeekOptions } from './config.ts'

export { Config, plainOptions, resolveAdapterOptions } from './config.ts'
export type { Options, ResolvedDeepSeekOptions } from './config.ts'
export const name = 'llm-deepseek-api-key'
export const inject = ['llm']

const PROVIDER = 'deepseek-official'

export function apply(ctx: Context, config: Config): void {
  const options = () => resolveAdapterOptions(plainOptions(config), launchEnvironmentOf(ctx))
  options()
  const resolveApiKey = async (connection: ResolvedDeepSeekOptions, request?: import('@deepseek-ai/dsh-llm').GenerateOptions): Promise<string> => {
    const ref = connection.apiKeyEnv
    const scopedRef = credentialRefForNamespace(ref, request?.credentialNamespace)
    const credentials = ctx.get('credentials')
    if (credentials !== undefined) {
      const hit = await credentials.resolve(scopedRef)
      if (hit !== undefined) return assertUsableApiKey(hit.value, 'llm-deepseek', scopedRef)
    } else {
      const ambient = launchEnvironmentOf(ctx).get(scopedRef)
      if (ambient !== undefined && ambient.value.length > 0) return assertUsableApiKey(ambient.value, 'llm-deepseek', scopedRef)
    }
    throw new LlmError(
      `llm-deepseek: no API key for provider route "${PROVIDER}"; store ${scopedRef} through the credentials`
      + ` service (the web Models page writes it), or export ${scopedRef} in the launching environment`,
      'MISSING_CREDENTIAL',
    )
  }
  ctx.llm.registerConfigurableProviders([
    { provider: PROVIDER, displayName: 'DeepSeek', settingsNs: ctx.fiber.entry?.options.id ?? name, settingsPath: [] },
  ])
  registerDeepSeekProvider(ctx, PROVIDER, {
    options, providerName: 'DeepSeek',
    resolveAuth: async (connection, request) => ({ headers: { 'x-api-key': await resolveApiKey(connection, request) } }),
    discoverModels: (provider) => {
      const connection = options()
      return Promise.resolve(connection.models.map(model => catalogModelInfo(provider, model)))
    },
  })
}
