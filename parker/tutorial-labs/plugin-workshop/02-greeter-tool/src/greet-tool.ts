import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {} from './greeter.ts'

export const name = 'parker-greet-tool'
export const inject = ['tools', 'parkerGreeter']

export function apply(ctx: Context): void {
  ctx.tools.register(defineTool({
    name: 'parker_greet',
    description: '使用 parkerGreeter 服务问候一个人。',
    parameters: {
      name: { type: 'string', required: true, description: '要问候的人名' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return ctx.parkerGreeter.greet(args.name)
    },
  }))
}
