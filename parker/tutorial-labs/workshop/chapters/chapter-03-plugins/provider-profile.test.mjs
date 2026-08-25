import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'
import { after, applyV1, before, cleanup, updateV2 } from './provider-profile.mjs'

async function fixture() {
  const directory = await mkdtemp(resolve(tmpdir(), 'dsh-provider-hmr-test-'))
  return {
    directory,
    patchPath: resolve(directory, 'cordis.patch.yml'),
    statePath: resolve(directory, 'state.json'),
  }
}

test('apply, update, and cleanup preserve an existing Profile Patch', async t => {
  const paths = await fixture()
  t.after(() => rm(paths.directory, { recursive: true, force: true }))
  const original = '- insert:\n    - id: existing\n      name: existing-plugin\n'
  await writeFile(paths.patchPath, original, 'utf8')

  await applyV1(paths)
  const first = await readFile(paths.patchPath, 'utf8')
  assert.ok(first.includes(before.apiKey))
  assert.ok(first.includes(before.baseURL))
  assert.ok(first.startsWith(original))

  await updateV2(paths)
  const second = await readFile(paths.patchPath, 'utf8')
  assert.ok(!second.includes(before.apiKey))
  assert.ok(second.includes(after.apiKey))
  assert.ok(second.includes(after.baseURL))

  await cleanup(paths)
  assert.equal(await readFile(paths.patchPath, 'utf8'), original)
})

test('a repeated experiment resets v2 to v1 and accepts an already-applied update', async t => {
  const paths = await fixture()
  t.after(() => rm(paths.directory, { recursive: true, force: true }))
  const original = '- insert:\n    - id: existing\n      name: existing-plugin\n'
  await writeFile(paths.patchPath, original, 'utf8')

  await applyV1(paths)
  await updateV2(paths)
  await updateV2(paths)

  await applyV1(paths)
  const reset = await readFile(paths.patchPath, 'utf8')
  assert.ok(reset.includes(before.apiKey))
  assert.ok(reset.includes(before.baseURL))
  assert.ok(!reset.includes(after.apiKey))
  assert.ok(!reset.includes(after.baseURL))

  await cleanup(paths)
  assert.equal(await readFile(paths.patchPath, 'utf8'), original)
})

test('cleanup refuses to overwrite an external edit', async t => {
  const paths = await fixture()
  t.after(() => rm(paths.directory, { recursive: true, force: true }))
  await writeFile(paths.patchPath, '[]\n', 'utf8')
  await applyV1(paths)
  await writeFile(paths.patchPath, `${await readFile(paths.patchPath, 'utf8')}# edited elsewhere\n`, 'utf8')

  await assert.rejects(cleanup(paths), /被其他操作修改/)
  assert.match(await readFile(paths.patchPath, 'utf8'), /edited elsewhere/)
})

test('apply replaces a commented empty-array placeholder and cleanup restores it', async t => {
  const paths = await fixture()
  t.after(() => rm(paths.directory, { recursive: true, force: true }))
  const original = '# Local Web Profile Patch\n# Loader entries follow.\n[]\n'
  await writeFile(paths.patchPath, original, 'utf8')

  await applyV1(paths)
  const applied = await readFile(paths.patchPath, 'utf8')
  assert.match(applied, /^# Local Web Profile Patch/m)
  assert.doesNotMatch(applied, /^\[\]$/m)
  assert.match(applied, /^- insert:$/m)

  await cleanup(paths)
  assert.equal(await readFile(paths.patchPath, 'utf8'), original)
})
