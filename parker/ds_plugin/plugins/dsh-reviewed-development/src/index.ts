import { homedir } from 'node:os'
import { resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { LocalGit } from './core/git.ts'
import { ProcessAgentRunner } from './core/agents.ts'
import { ReviewedDevelopmentWorkflow } from './core/workflow.ts'

export const name = 'dsh-reviewed-development'
export const inject = ['tools', 'systemPrompt']

interface StartArgs { task: string }
interface ControlArgs { runId: string; action: string; notes?: string }
interface StatusArgs { runId: string }

const actionNames = ['clarification_answer', 'confirm_requirements', 'revise_requirements', 'approve_review', 'cancel', 'test_failed', 'accept_product', 'reject_product', 'resume', 'start_review', 'start_testing', 'start_product_acceptance'] as const

function textOutput(text: string): { text: string } { return { text } }
function render(_args: unknown, value: { text: string }) { return [{ type: 'text' as const, text: value.text }] }

export function apply(ctx: Context): void {
  const root = resolve(process.env.DSH_HOME ?? homedir())
  const workflow = new ReviewedDevelopmentWorkflow({
    repoPath: resolve(process.env.DSH_REVIEWED_REPO ?? process.cwd()),
    dataRoot: root,
    git: new LocalGit(),
    agents: new ProcessAgentRunner({
      codexCommand: process.env.DSH_REVIEWED_CODEX ?? 'codex',
      claudeCommand: process.env.DSH_REVIEWED_CLAUDE ?? 'claude',
    }),
  })

  ctx.tools.register(defineTool({
    name: 'reviewed_dev_start',
    description: 'Start the natural-language reviewed development workflow. DS remains the product manager; Codex develops product code and Claude Code writes and runs tests. Use this only after understanding the user request.',
    parameters: { task: { type: 'string', required: true, description: 'The user request in natural language.' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: { text: { type: 'string', required: true } } }, render },
    async execute(args: StartArgs) {
      const snapshot = await workflow.start(args.task)
      return textOutput(format(snapshot))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'reviewed_dev_control',
    description: `Advance a reviewed development run. Agent reports and decisions stay natural language; notes must contain the full natural-language explanation. Allowed actions: ${actionNames.join(', ')}. The workflow rejects actions that skip a gate.`,
    parameters: {
      runId: { type: 'string', required: true, description: 'Run id returned by reviewed_dev_start.' },
      action: { type: 'string', required: true, description: `One of: ${actionNames.join(', ')}.` },
      notes: { type: 'string', description: 'Natural-language requirements, review, test, acceptance, or recovery notes.' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { text: { type: 'string', required: true } } }, render },
    async execute(args: ControlArgs) {
      if (!(actionNames as readonly string[]).includes(args.action)) throw new Error(`unknown reviewed development action: ${args.action}`)
      const snapshot = await workflow.control(args.runId, args.action as never, args.notes ?? '')
      return textOutput(format(snapshot))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'reviewed_dev_status',
    description: 'Read the current reviewed development run. This never starts an Agent and never writes Git.',
    parameters: { runId: { type: 'string', required: true, description: 'Run id returned by reviewed_dev_start.' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: { text: { type: 'string', required: true } } }, render },
    async execute(args: StatusArgs) {
      return textOutput(format(await workflow.status(args.runId)))
    },
  }))

  ctx.systemPrompt.section({
    name: 'reviewed-development',
    order: 104,
    text: 'When the user explicitly asks for reviewed development, act as product manager: understand and clarify the request, record requirements, let the developer and tester review it, then use the reviewed_dev_* tools. Do not bypass the workflow with shell, terminal, direct subagents, git, or pull-request tools while this mode is active. All Agent communication is natural language.',
  })
}

function format(snapshot: Awaited<ReturnType<ReviewedDevelopmentWorkflow['status']>>): string {
  const lines = [
    `runId: ${snapshot.runId}`,
    `state: ${snapshot.state}`,
    `branch: ${snapshot.branch ?? '(not created)'}`,
    `base: ${snapshot.baseBranch} @ ${snapshot.baseCommit}`,
  ]
  if (snapshot.requirements) lines.push(`requirements:\n${snapshot.requirements}`)
  if (snapshot.developerReview) lines.push(`developer review:\n${snapshot.developerReview}`)
  if (snapshot.testerReview) lines.push(`tester review:\n${snapshot.testerReview}`)
  if (snapshot.developerReport) lines.push(`developer report:\n${snapshot.developerReport}`)
  if (snapshot.testerReport) lines.push(`tester report:\n${snapshot.testerReport}`)
  if (snapshot.testReport) lines.push(`test report:\n${snapshot.testReport}`)
  if (snapshot.productAcceptance) lines.push(`product acceptance:\n${snapshot.productAcceptance}`)
  if (snapshot.userAcceptance) lines.push(`user acceptance:\n${snapshot.userAcceptance}`)
  if (snapshot.prUrl) lines.push(`PR: ${snapshot.prUrl}`)
  if (snapshot.blockedReason) lines.push(`blocked: ${snapshot.blockedReason}`)
  return lines.join('\n')
}
