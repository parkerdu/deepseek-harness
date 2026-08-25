import type { Context } from '@deepseek-ai/cordis'
import type {} from './mock-provider.ts'

export const name = 'provider-consumer'
export const inject = ['mockProvider']

export function apply(ctx: Context): void {
  console.log(`[provider-consumer] using ${ctx.mockProvider.config.baseURL}`)
  ctx.effect(() => () => {
    console.log('[provider-consumer] detached')
  })
}
