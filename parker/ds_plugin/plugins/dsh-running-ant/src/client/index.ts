/** Browser plugin that contributes the running-ant indicator to the composer dock. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { RunningAnt } from './RunningAnt.tsx'

/** Required browser service for the input-dock contribution. */
export const inject = ['slots']

/** Register after the conversation package declares its session-scoped dock. */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'running-ant',
    order: 30,
    label: '运行中的蓝色蚂蚁',
  }, RunningAnt))
}
