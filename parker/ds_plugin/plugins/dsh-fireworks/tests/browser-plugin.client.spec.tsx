import { describe, expect, it } from 'vitest'
import { apply, inject } from '../src/client/index.ts'

describe('dsh-fireworks browser plugin', () => {
  it('registers one visible fireworks element in the conversation input dock', () => {
    let injectedSlot: string | undefined
    let registered: { options: unknown, component: unknown } | undefined
    const ctx = {
      slots: {
        inject(slot: string, callback: () => unknown) {
          injectedSlot = slot
          return callback()
        },
        register(options: unknown, component: unknown) {
          registered = { options, component }
          return () => { registered = undefined }
        },
      },
    }

    expect(inject).toEqual(['slots'])
    apply(ctx as never)
    expect(injectedSlot).toBe('conversation.input.dock')
    expect(registered?.options).toMatchObject({ id: 'fireworks', order: 10 })
    expect(registered?.component).toBeTypeOf('function')
  })
})
