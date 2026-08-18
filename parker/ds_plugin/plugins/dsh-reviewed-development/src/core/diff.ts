import { createHash } from 'node:crypto'

export function normalizeDiff(diff: string): string {
  return diff.replaceAll('\r\n', '\n').replace(/index [0-9a-f]+\.\.[0-9a-f]+( \d+)?\n/g, '').trim() + '\n'
}

export function diffHash(diff: string): string {
  return createHash('sha256').update(normalizeDiff(diff)).digest('hex')
}

export function changedPaths(diff: string): string[] {
  const paths = new Set<string>()
  for (const line of diff.split('\n')) {
    const match = /^(?:\+\+\+|---) [ab]\\?\/?(.+)$/.exec(line)
    if (match?.[1] !== undefined && match[1] !== '/dev/null') paths.add(match[1])
  }
  return [...paths].sort()
}

function blocksByPath(diff: string): Map<string, string> {
  const blocks = new Map<string, string>()
  let current: string | undefined
  let lines: string[] = []
  const flush = () => {
    if (current !== undefined) blocks.set(current, lines.join('\n'))
  }
  for (const line of diff.split('\n')) {
    const header = /^diff --git a\/(.+) b\/(.+)$/.exec(line)
    if (header?.[2] !== undefined) {
      flush()
      current = header[2]
      lines = [line]
    } else if (current !== undefined) {
      lines.push(line)
    }
  }
  flush()
  return blocks
}

export function changedProductPaths(before: string, after: string): string[] {
  const previous = blocksByPath(before)
  const current = blocksByPath(after)
  return [...current.entries()]
    .filter(([path, block]) => !isTestPath(path) && previous.get(path) !== block)
    .map(([path]) => path)
    .sort()
}

export function isTestPath(path: string): boolean {
  return /^(?:test|tests|__tests__|spec|specs)(?:\/|$)|\.(?:test|spec)\.[^/]+$/.test(path)
}

export function violatesWriteSet(diff: string, role: 'developer' | 'tester'): string[] {
  const paths = changedPaths(diff)
  return paths.filter(path => role === 'developer' ? isTestPath(path) : !isTestPath(path))
}
