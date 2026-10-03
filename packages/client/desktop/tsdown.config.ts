import { staticLinked } from '../tsdown.client.ts'

export default staticLinked(
  '@deepseek-ai/dsh-client-desktop',
  ['lib/types/index.js', 'lib/types/apply-injections.js'],
)
