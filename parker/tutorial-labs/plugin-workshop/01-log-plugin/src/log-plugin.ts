import type { Context } from '@deepseek-ai/cordis'

export const name = 'parker-log-plugin'

export function apply(_ctx: Context): void {
  console.log('[parker-log-plugin] loaded successfully')
}
