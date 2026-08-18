import { describe, expect, it } from 'vitest'
import { ReviewedDevelopmentWorkflow } from '../src/core/workflow.ts'
import type { AgentRunner, GitAdapter, Persistence, RunSnapshot } from '../src/core/types.ts'

class FakeGit implements GitAdapter {
  clean = true
  currentBranch = 'main'
  currentHead = 'base'
  diffText = ''
  async status() { return { clean: this.clean, porcelain: this.clean ? '' : '?? dirty.txt' } }
  async branch() { return this.currentBranch }
  async head() { return this.currentHead }
  async createBranch(_repo: string, branch: string) { this.currentBranch = branch }
  async diff() { return this.diffText }
  async commit() { return this.currentHead }
  async addCommit() { this.currentHead = 'commit'; return this.currentHead }
  async push() {}
  async createPr() { return 'https://github.com/example/repo/pull/1' }
}

class FakeAgents implements AgentRunner {
  async run(role: 'developer' | 'tester') { return `${role} passed review and tests passed` }
}

class MemoryPersistence implements Persistence {
  readonly snapshots = new Map<string, RunSnapshot>()
  async append() {}
  async save(snapshot: RunSnapshot) { this.snapshots.set(snapshot.runId, snapshot) }
  async load(runId: string) { return this.snapshots.get(runId) }
}

describe('reviewed development workflow', () => {
  it('rejects a dirty repository before starting any Agent', async () => {
    const git = new FakeGit()
    git.clean = false
    const workflow = new ReviewedDevelopmentWorkflow({ repoPath: '/repo', dataRoot: '/tmp/dsh', git, agents: new FakeAgents(), persistence: new MemoryPersistence() })
    await expect(workflow.start('add export')).rejects.toThrow(/working tree must be clean/)
  })

  it('keeps a new run in planning until DS supplies requirements', async () => {
    const workflow = new ReviewedDevelopmentWorkflow({ repoPath: '/repo', dataRoot: '/tmp/dsh', git: new FakeGit(), agents: new FakeAgents(), persistence: new MemoryPersistence() })
    const run = await workflow.start('add export')
    expect(run.state).toBe('planning')
    await expect(workflow.control(run.runId, 'approve_review', 'skip')).rejects.toThrow(/invalid workflow transition/)
  })
})
