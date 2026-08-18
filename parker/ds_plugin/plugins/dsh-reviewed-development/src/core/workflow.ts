import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { changedProductPaths, changedPaths, diffHash, isTestPath } from './diff.ts'
import { transition, type WorkflowAction } from './machine.ts'
import { JsonlPersistence } from './persistence.ts'
import type { AgentRunner, GitAdapter, Persistence, RunSnapshot, WorkflowState } from './types.ts'

export interface WorkflowOptions {
  repoPath: string
  dataRoot: string
  git: GitAdapter
  agents: AgentRunner
  persistence?: Persistence
}

export class ReviewedDevelopmentWorkflow {
  private readonly persistence: Persistence
  private readonly runs = new Map<string, RunSnapshot>()
  private readonly locks = new Map<string, Promise<void>>()

  constructor(private readonly options: WorkflowOptions) {
    this.persistence = options.persistence ?? new JsonlPersistence(join(options.dataRoot, 'reviewed-development'))
  }

  async start(task: string): Promise<RunSnapshot> {
    if (!task.trim()) throw new Error('task must not be empty')
    const status = await this.options.git.status(this.options.repoPath)
    if (!status.clean) throw new Error(`working tree must be clean before starting:\n${status.porcelain}`)
    const snapshot: RunSnapshot = {
      runId: randomUUID(), repoPath: this.options.repoPath, task: task.trim(), state: 'planning',
      baseBranch: await this.options.git.branch(this.options.repoPath), baseCommit: await this.options.git.head(this.options.repoPath),
      requirementsConfirmed: false, reviewRound: 0, pushCompleted: false, commitCompleted: false, prCompleted: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    this.runs.set(snapshot.runId, snapshot)
    await this.save(snapshot, 'run_started', { runId: snapshot.runId })
    return snapshot
  }

  async status(runId: string): Promise<RunSnapshot> {
    const snapshot = this.runs.get(runId) ?? await this.persistence.load(runId)
    if (snapshot === undefined) throw new Error(`unknown run: ${runId}`)
    this.runs.set(runId, snapshot)
    return snapshot
  }

  async control(runId: string, action: WorkflowAction, notes = ''): Promise<RunSnapshot> {
    try {
      return await this.lock(runId, async () => {
      const current = await this.status(runId)
      if (action === 'cancel') return this.move(current, 'cancel', notes)
      if (action === 'clarification_answer') return this.move(current, 'clarification_answer', notes, { requirements: notes })
      if (action === 'revise_requirements') return this.move(current, 'revise_requirements', notes, { requirementsConfirmed: false })
      if (action === 'confirm_requirements') {
        if (!notes.trim()) throw new Error('requirements confirmation requires the confirmed requirements text')
        const confirmed = await this.move(current, 'confirm_requirements', notes, { requirements: notes, requirementsConfirmed: true })
        return this.review(confirmed, notes)
      }
      if (action === 'approve_review') return this.approveAndRun(current, notes)
      if (action === 'start_review') return this.review(current, notes)
      if (action === 'test_failed') return this.move(current, 'test_failed', notes, { testReport: notes })
      if (action === 'start_product_acceptance') return this.move(current, 'start_product_acceptance', notes, { productAcceptance: notes })
      if (action === 'reject_product') return this.move(current, 'reject_product', notes)
      if (action === 'accept_product' && current.state === 'awaiting_user_acceptance') return this.createPr(current, notes)
      if (action === 'accept_product') return this.move(current, 'accept_product', notes, { productAcceptance: notes })
      if (action === 'resume') return this.move(current, 'resume', notes)
      if (action === 'start_testing') return this.test(current, notes)
      throw new Error(`unsupported action ${action} in state ${current.state}`)
      })
    } catch (error: unknown) {
      const current = await this.status(runId)
      const failureState = current.state === 'creating_pr' ? 'pr_failed' : 'failed'
      if (current.state !== 'failed' && current.state !== 'pr_failed' && current.state !== 'cancelled' && current.state !== 'completed') {
        await this.saveTransition({ ...current, state: failureState, blockedReason: error instanceof Error ? error.message : String(error) }, 'workflow_failed', { error: error instanceof Error ? error.message : String(error) })
      }
      throw error
    }
  }

  private async review(current: RunSnapshot, requirements: string): Promise<RunSnapshot> {
    const text = requirements || current.requirements || current.task
    const [developerReview, testerReview] = await Promise.all([
      this.options.agents.run('developer', `You are the developer reviewing a product requirements document.\n\nOriginal request:\n${current.task}\n\nRequirements:\n${text}\n\nReturn a plain-language review: feasibility, risks, implementation steps, and whether you can proceed. Do not edit files.`, { cwd: current.repoPath, readOnly: true }),
      this.options.agents.run('tester', `You are the tester reviewing a product requirements document.\n\nOriginal request:\n${current.task}\n\nRequirements:\n${text}\n\nReturn a plain-language review: missing acceptance criteria, test cases, risks, and whether testing can proceed. Do not edit files.`, { cwd: current.repoPath, readOnly: true }),
    ])
    return this.saveTransition({ ...current, state: 'awaiting_review_decision', developerReview, testerReview, reviewRound: current.reviewRound + 1 }, 'requirements_reviewed', { developerReview, testerReview })
  }

  private async approveAndRun(current: RunSnapshot, decision: string): Promise<RunSnapshot> {
    const branch = `dsh/${slug(current.task)}-${current.runId.slice(0, 8)}`
    if (current.branch === undefined) {
      if ((await this.options.git.head(current.repoPath)) !== current.baseCommit) throw new Error('HEAD changed since the run started')
      await this.options.git.createBranch(current.repoPath, branch)
    }
    const next = await this.move(current, 'approve_review', decision, { branch })
    const requirements = next.requirements ?? next.task
    const [developerReport, testerReport] = await Promise.all([
      this.options.agents.run('developer', `You are the developer. Implement this confirmed product request in the current repository.\n\nRequest:\n${next.task}\n\nRequirements:\n${requirements}\n\nDeveloper review:\n${next.developerReview ?? ''}\n\nWrite product implementation only. Do not modify tests. Return a plain-language summary and the validation commands you ran.`, { cwd: next.repoPath, readOnly: false }),
      this.options.agents.run('tester', `You are the tester. Create the tests needed for this confirmed product request in the current repository.\n\nRequest:\n${next.task}\n\nRequirements:\n${requirements}\n\nTester review:\n${next.testerReview ?? ''}\n\nWrite tests and test fixtures only. Do not modify product implementation. Return a plain-language summary and the test command you will run.`, { cwd: next.repoPath, readOnly: false, testOnly: true }),
    ])
    const fullDiff = await this.options.git.diff(next.repoPath, next.baseCommit)
    const unexpectedPaths = changedPaths(fullDiff).filter(path => !isTestPath(path) && !path.startsWith('src/') && !path.startsWith('lib/') && !path.startsWith('app/') && !path.startsWith('packages/') && !path.endsWith('.md'))
    if (unexpectedPaths.length > 0) throw new Error(`agent write-set violation: unexpected paths ${unexpectedPaths.join(',')}`)
    const implemented = await this.saveTransition(next, 'implementation_finished', { developerReport, testerReport, lastDiffHash: diffHash(fullDiff) })
    return this.test(implemented, '')
  }

  private async test(current: RunSnapshot, _notes: string): Promise<RunSnapshot> {
    const beforeDiff = await this.options.git.diff(current.repoPath, current.baseCommit)
    const report = await this.options.agents.run('tester', `You are the tester. Test the current implementation against the requirements below. Run the relevant tests and inspect failures. Do not modify product implementation. Return a plain-language test report with commands, exit status, covered acceptance criteria, and whether the change passes.\n\nRequirements:\n${current.requirements ?? current.task}`, { cwd: current.repoPath, readOnly: false, testOnly: true })
    const diff = await this.options.git.diff(current.repoPath, current.baseCommit)
    const changedProduct = changedProductPaths(beforeDiff, diff)
    if (changedProduct.length > 0) throw new Error(`tester modified product implementation during testing: ${changedProduct.join(', ')}`)
    const state: WorkflowState = /\b(pass|passed|success|successful|通过)\b/i.test(report) ? 'awaiting_product_acceptance' : 'implementing_and_authoring_tests'
    return this.saveTransition({ ...current, state, testReport: report, lastDiffHash: diffHash(diff) }, state === 'awaiting_product_acceptance' ? 'testing_passed' : 'testing_failed', { report })
  }

  private async createPr(current: RunSnapshot, notes: string): Promise<RunSnapshot> {
    const creating = await this.move(current, 'accept_product', notes, { state: 'creating_pr', userAcceptance: notes })
    const diff = await this.options.git.diff(creating.repoPath, creating.baseCommit)
    if (creating.lastDiffHash !== undefined && diffHash(diff) !== creating.lastDiffHash) throw new Error('working tree changed after user acceptance; re-test and re-accept')
    const commit = await this.options.git.addCommit(creating.repoPath, creating.baseCommit, `feat: ${shortTitle(creating.task)}`)
    const branch = creating.branch ?? await this.options.git.branch(creating.repoPath)
    const pushed = await this.options.git.push(creating.repoPath, branch)
    void pushed
    const prUrl = await this.options.git.createPr(creating.repoPath, creating.baseBranch, branch, shortTitle(creating.task), `${notes || creating.productAcceptance || 'Implemented through reviewed development workflow.'}\n\nOriginal request:\n${creating.task}`)
    return this.saveTransition({ ...creating, commit, commitCompleted: true, pushCompleted: true, prCompleted: true, prUrl }, 'pr_finished', { prUrl })
  }

  private async move(current: RunSnapshot, action: WorkflowAction, notes: string, patch: Partial<RunSnapshot> = {}): Promise<RunSnapshot> {
    const nextState = patch.state ?? transition(current.state, action)
    return this.saveTransition({ ...current, ...patch, state: nextState }, `control:${action}`, { notes })
  }

  private async saveTransition(snapshot: RunSnapshot, type: string, data: Record<string, unknown>): Promise<RunSnapshot> {
    const next = { ...snapshot, updatedAt: new Date().toISOString() }
    this.runs.set(next.runId, next)
    await this.persistence.append({ type, state: next.state, data: { runId: next.runId, ...data } })
    await this.persistence.save(next)
    return next
  }

  private async save(snapshot: RunSnapshot, type: string, data: Record<string, unknown>): Promise<RunSnapshot> {
    return this.saveTransition(snapshot, type, data)
  }

  private async lock<T>(runId: string, work: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(runId) ?? Promise.resolve()
    let release!: () => void
    const current = new Promise<void>(resolve => { release = resolve })
    this.locks.set(runId, previous.then(() => current))
    await previous
    try { return await work() } finally { release(); if (this.locks.get(runId) === current) this.locks.delete(runId) }
  }
}

function slug(task: string): string {
  return task.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'task'
}

function shortTitle(task: string): string {
  return task.replace(/\s+/g, ' ').trim().slice(0, 60) || 'reviewed development'
}
