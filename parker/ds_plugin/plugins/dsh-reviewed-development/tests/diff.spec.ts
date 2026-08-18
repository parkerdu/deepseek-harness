import { describe, expect, it } from 'vitest'
import { changedPaths, diffHash, violatesWriteSet } from '../src/core/diff.ts'

const diff = [
  'diff --git a/src/export.ts b/src/export.ts',
  '--- a/src/export.ts',
  '+++ b/src/export.ts',
  '@@ -1 +1 @@',
  '-old',
  '+new',
  'diff --git a/tests/export.test.ts b/tests/export.test.ts',
  '--- a/tests/export.test.ts',
  '+++ b/tests/export.test.ts',
  '@@ -1 +1 @@',
  '-old test',
  '+new test',
].join('\n')

describe('reviewed development diff gates', () => {
  it('normalizes and hashes equivalent line endings', () => {
    expect(diffHash(diff)).toBe(diffHash(`${diff.replaceAll('\n', '\r\n')}\r\n`))
  })

  it('extracts paths and enforces role write sets', () => {
    expect(changedPaths(diff)).toEqual(['src/export.ts', 'tests/export.test.ts'])
    expect(violatesWriteSet(diff, 'developer')).toEqual(['tests/export.test.ts'])
    expect(violatesWriteSet(diff, 'tester')).toEqual(['src/export.ts'])
  })
})
