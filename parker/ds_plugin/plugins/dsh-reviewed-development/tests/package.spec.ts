import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('package contract', () => {
  it('declares an installable host and web bundle', async () => {
    const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
    const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
    expect(manifest.name).toBe('dsh-reviewed-development')
    expect(manifest.dsh.bundle.patch).toBe('./cordis.patch.yml')
    expect(manifest.dsh.client.platform).toBe('web')
    expect(patch).toContain('name: dsh-reviewed-development')
  })
})
