import { useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

export type ReviewedDevelopmentProps = PropsRuntime<'conversation.input.dock'>

export function ReviewedDevelopment({ useSession }: ReviewedDevelopmentProps) {
  const running = useSession(snapshot => snapshot.running)
  const [enabled, setEnabled] = useState(false)
  if (!running) return null
  return (
    <div data-reviewed-development className="dsh-reviewed-development">
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => {
          const next = !enabled
          setEnabled(next)
          window.dispatchEvent(new CustomEvent('dsh:reviewed-development-toggle', { detail: { enabled: next } }))
        }}
      >
        {enabled ? '评审开发模式已开启' : '开启评审开发模式'}
      </button>
      {enabled && <span role="status">下一条需求将由 DS 编排 Codex 开发、Claude 测试并等待用户验收。</span>}
    </div>
  )
}
