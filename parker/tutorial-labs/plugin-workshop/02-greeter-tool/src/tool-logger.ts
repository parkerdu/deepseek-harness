import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-tools'

export const name = 'parker-tool-logger'
export const inject = ['tools']

export function apply(ctx: Context): void {
  ctx.on('tools/result', (execution, result) => {
    const text = result.content
      .map(block => block.type === 'text' ? block.text : '')
      .join('')
    console.log(`[parker-tool-logger] ${execution.name} -> ${text}`)
  })
}
