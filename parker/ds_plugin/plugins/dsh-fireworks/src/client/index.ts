import { createElement } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'

export const inject = ['slots']

export function apply(ctx: ClientContext): void {
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({ name: 'conversation.input.dock', id: 'fireworks', order: 10, label: '烟花插件' }, () => createElement('span', { title: 'dsh-fireworks 已加载', style: { fontSize: 32 } }, '🎆')))
}
