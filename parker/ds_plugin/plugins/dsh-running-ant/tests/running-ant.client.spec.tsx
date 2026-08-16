// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { RunningAntProps } from '../src/client/RunningAnt.tsx'
import { RunningAnt } from '../src/client/RunningAnt.tsx'

afterEach(cleanup)

function props(running: boolean): RunningAntProps {
  return {
    useSession: selector => selector({ running } as never),
  } as RunningAntProps
}

describe('RunningAnt', () => {
  it('renders an accessible crawler while the conversation runs', () => {
    render(<RunningAnt {...props(true)} />)
    expect(screen.getByRole('img', { name: '正在爬行的蓝色蚂蚁' })).toBeTruthy()
    expect(document.querySelector('[data-running-ant]')).not.toBeNull()
  })

  it('renders nothing while the conversation is idle', () => {
    const view = render(<RunningAnt {...props(false)} />)
    expect(view.container.innerHTML).toBe('')
  })
})
