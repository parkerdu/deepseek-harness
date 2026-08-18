import type { Context } from '@deepseek-ai/cordis'
import type {} from './greeter.ts'

export const name = 'tutorial-needs-greeter'
export const inject = ['greeter']

export function apply(ctx: Context) {
  console.log(ctx.greeter.greet('Parker'))
}
