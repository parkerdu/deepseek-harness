import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import type { GitAdapter } from './types.ts'

const exec = promisify(execFile)

async function git(repoPath: string, args: string[]): Promise<string> {
  const result = await exec('git', ['-C', repoPath, ...args], { maxBuffer: 8 * 1024 * 1024 })
  return result.stdout.trim()
}

export class LocalGit implements GitAdapter {
  async status(repoPath: string) {
    const porcelain = await git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all'])
    return { clean: porcelain.length === 0, porcelain }
  }

  async branch(repoPath: string): Promise<string> {
    return git(repoPath, ['symbolic-ref', '--quiet', '--short', 'HEAD'])
  }

  async head(repoPath: string): Promise<string> {
    return git(repoPath, ['rev-parse', 'HEAD'])
  }

  async createBranch(repoPath: string, branch: string): Promise<void> {
    await git(repoPath, ['switch', '-c', branch])
  }

  async diff(repoPath: string, baseCommit: string): Promise<string> {
    const tracked = await git(repoPath, ['diff', '--binary', '--no-ext-diff', baseCommit, '--'])
    const untracked = (await git(repoPath, ['ls-files', '--others', '--exclude-standard'])).split('\n').filter(Boolean)
    const additions: string[] = []
    for (const path of untracked) {
      const content = await readFile(`${repoPath}/${path}`, 'utf8')
      additions.push(`diff --git a/${path} b/${path}\nnew file mode 100644\n--- /dev/null\n+++ b/${path}\n@@ -0,0 +1,${content.split('\n').length} @@\n${content.split('\n').map(line => `+${line}`).join('\n')}`)
    }
    return [tracked, ...additions].filter(Boolean).join('\n')
  }

  async addCommit(repoPath: string, baseCommit: string, message: string): Promise<string> {
    await git(repoPath, ['add', '--all', '--', '.'])
    await git(repoPath, ['commit', '-m', message])
    return this.head(repoPath)
  }

  async commit(repoPath: string): Promise<string> {
    return this.head(repoPath)
  }

  async push(repoPath: string, branch: string): Promise<void> {
    await git(repoPath, ['push', '-u', 'origin', branch])
  }

  async createPr(repoPath: string, baseBranch: string, branch: string, title: string, body: string): Promise<string> {
    return (await exec('gh', ['pr', 'create', '--base', baseBranch, '--head', branch, '--title', title, '--body', body], { cwd: repoPath, maxBuffer: 2 * 1024 * 1024 })).stdout.trim()
  }
}
