export const TERMINAL_STATES = ['completed', 'cancelled', 'failed', 'paused_no_progress', 'pr_failed'] as const

export const WORKFLOW_STATES = [
  'planning',
  'clarifying_requirements',
  'drafting_requirements',
  'awaiting_requirements_confirmation',
  'reviewing_requirements',
  'awaiting_review_decision',
  'implementing_and_authoring_tests',
  'testing',
  'awaiting_product_acceptance',
  'awaiting_user_acceptance',
  'creating_pr',
  ...TERMINAL_STATES,
] as const

export type WorkflowState = typeof WORKFLOW_STATES[number]
export type TerminalState = typeof TERMINAL_STATES[number]

export interface EventRecord {
  seq: number
  at: string
  type: string
  state: WorkflowState
  data?: Record<string, unknown>
}

export interface RunSnapshot {
  runId: string
  repoPath: string
  task: string
  state: WorkflowState
  baseBranch: string
  baseCommit: string
  branch?: string
  requirements?: string
  requirementsConfirmed: boolean
  developerReview?: string
  testerReview?: string
  developerReport?: string
  testerReport?: string
  testReport?: string
  productAcceptance?: string
  userAcceptance?: string
  lastDiffHash?: string
  lastApprovedDiffHash?: string
  reviewRound: number
  blockedReason?: string
  prUrl?: string
  commit?: string
  pushCompleted: boolean
  commitCompleted: boolean
  prCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AgentRunner {
  run(role: 'developer' | 'tester', prompt: string, options: {
    cwd: string
    readOnly: boolean
    testOnly?: boolean
    signal?: AbortSignal
  }): Promise<string>
}

export interface GitAdapter {
  status(repoPath: string): Promise<{ clean: boolean; porcelain: string }>
  branch(repoPath: string): Promise<string>
  commit(repoPath: string): Promise<string>
  head(repoPath: string): Promise<string>
  createBranch(repoPath: string, branch: string): Promise<void>
  diff(repoPath: string, baseCommit: string): Promise<string>
  addCommit(repoPath: string, baseCommit: string, message: string): Promise<string>
  push(repoPath: string, branch: string): Promise<void>
  createPr(repoPath: string, baseBranch: string, branch: string, title: string, body: string): Promise<string>
}

export interface Persistence {
  append(event: Omit<EventRecord, 'seq' | 'at'>): Promise<void>
  save(snapshot: RunSnapshot): Promise<void>
  load(runId: string): Promise<RunSnapshot | undefined>
}
