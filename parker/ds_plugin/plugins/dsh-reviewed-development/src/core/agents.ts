import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { AgentRunner } from './types.ts'

const exec = promisify(execFile)

export interface ProcessAgentConfig {
  codexCommand?: string
  claudeCommand?: string
  timeoutMs?: number
}

function fixedCommand(value: string | undefined, fallback: string): string {
  const command = value?.trim() || fallback
  if (/\s/.test(command)) throw new Error('agent executable must be a single executable path')
  return command
}

/**
 * Natural-language one-shot runner. The plugin owns argv and cwd; agent output
 * is deliberately returned as plain text and is never parsed as a protocol.
 */
export class ProcessAgentRunner implements AgentRunner {
  constructor(private readonly config: ProcessAgentConfig = {}) {}

  async run(role: 'developer' | 'tester', prompt: string, options: { cwd: string; readOnly: boolean; testOnly?: boolean; signal?: AbortSignal }): Promise<string> {
    const command = fixedCommand(role === 'developer' ? this.config.codexCommand : this.config.claudeCommand, role === 'developer' ? 'codex' : 'claude')
    const args = role === 'developer'
      ? ['exec', '--sandbox', options.readOnly ? 'read-only' : 'workspace-write', '--ask-for-approval', 'never', prompt]
      : ['-p', prompt, '--output-format', 'text']
    const result = await exec(command, args, {
      cwd: options.cwd,
      timeout: this.config.timeoutMs ?? 30 * 60 * 1000,
      maxBuffer: 16 * 1024 * 1024,
      signal: options.signal,
      env: { ...process.env, DSH_REVIEWED_ROLE: role, DSH_REVIEWED_TEST_ONLY: options.testOnly ? '1' : '0' },
    })
    return result.stdout.trim()
  }
}
