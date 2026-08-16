// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { apply, inject } from '../src/client/index.ts'
import { RunningAnt } from '../src/client/RunningAnt.tsx'

describe('dsh-running-ant browser plugin', () => {
  it('waits for the input dock and registers one uniquely identified entry', () => {
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
    expect(registered?.options).toMatchObject({ id: 'running-ant', order: 30 })
    expect(registered?.component).toBe(RunningAnt)
  })
})
