import type { Context } from '@deepseek-ai/cordis'
import { CallId } from '@deepseek-ai/dsh-llm'

export const inject = ['tools']

export function apply(ctx: Context): void {
  void ctx.tools.execute({
    callId: CallId('workshop-smoke-1'),
    name: 'parker_greet',
    arguments: { name: 'Parker' },
    signal: new AbortController().signal,
  }).then(result => {
    console.log('tool replied:', JSON.stringify(result.content))
  })
}
