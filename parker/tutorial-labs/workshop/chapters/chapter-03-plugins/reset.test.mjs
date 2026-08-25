import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'
import { resetWorkshopState } from './reset.mjs'

async function fixture() {
  const directory = await mkdtemp(resolve(tmpdir(), 'dsh-workshop-reset-test-'))
  const profileDirectory = resolve(directory, '.dsh/profiles/web')
  await mkdir(profileDirectory, { recursive: true })
  return { directory, profileDirectory, repositoryRoot: resolve(directory, 'deepseek-harness') }
}

test('reset stops owned listeners, restores the Provider experiment, and removes course bundles', async t => {
  const paths = await fixture()
  t.after(() => rm(paths.directory, { recursive: true, force: true }))
  const antArchive = resolve(paths.repositoryRoot, 'parker/ds_plugin/dist/dsh-running-ant-0.1.0.tgz')
  const manifestPath = resolve(paths.profileDirectory, 'package.json')
  const manifest = {
    name: 'dsh-profile-web',
    private: true,
    dependencies: {
      'dsh-running-ant': `file:${antArchive}`,
      '@linxin666/dsh-web-ui-all': '^0.2.6',
      'user-owned-plugin': '1.0.0',
    },
    dsh: {
      profile: {
        bundles: [
          '@deepseek-ai/dsh-base',
          '@deepseek-ai/dsh-web-app',
          'dsh-running-ant',
          '@linxin666/dsh-web-ui-all',
          'user-owned-plugin',
        ],
      },
    },
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const listeners = new Map([
    [3090, [{ pid: 101, command: 'node parker/tutorial-labs/workshop/workshop-server.mjs', cwd: paths.repositoryRoot }]],
    [3082, [{ pid: 102, command: 'node --import tsx/esm apps/cli/src/bin.ts web --patch hello.yml --port 3082', cwd: paths.repositoryRoot }]],
  ])
  const stopped = []
  const removed = []
  let providerCleanupCount = 0

  const result = await resetWorkshopState({
    repositoryRoot: paths.repositoryRoot,
    profileDirectory: paths.profileDirectory,
    providerStatePath: resolve(paths.directory, 'provider-state.json'),
    inspectPort: async port => listeners.get(port) ?? [],
    stopListener: async listener => stopped.push(listener.pid),
    cleanupProvider: async () => { providerCleanupCount += 1 },
    removeProfilePlugin: async packageName => {
      removed.push(packageName)
      const current = JSON.parse(await readFile(manifestPath, 'utf8'))
      delete current.dependencies[packageName]
      current.dsh.profile.bundles = current.dsh.profile.bundles.filter(name => name !== packageName)
      await writeFile(manifestPath, `${JSON.stringify(current, null, 2)}\n`, 'utf8')
    },
    writeLine: () => {},
  })

  assert.deepEqual(stopped, [101, 102])
  assert.deepEqual(removed, ['dsh-running-ant', '@linxin666/dsh-web-ui-all'])
  assert.equal(providerCleanupCount, 1)
  assert.deepEqual(result.stoppedPorts, [3090, 3082])
  assert.deepEqual(result.removedPlugins, removed)
  const cleaned = JSON.parse(await readFile(manifestPath, 'utf8'))
  assert.deepEqual(cleaned.dependencies, { 'user-owned-plugin': '1.0.0' })
  assert.ok(cleaned.dsh.profile.bundles.includes('user-owned-plugin'))
})

test('reset refuses to stop a listener that does not belong to this Workshop', async t => {
  const paths = await fixture()
  t.after(() => rm(paths.directory, { recursive: true, force: true }))
  let providerCleanupCount = 0

  await assert.rejects(
    resetWorkshopState({
      repositoryRoot: paths.repositoryRoot,
      profileDirectory: paths.profileDirectory,
      providerStatePath: resolve(paths.directory, 'provider-state.json'),
      inspectPort: async port => port === 3083
        ? [{ pid: 303, command: 'node unrelated-server.mjs', cwd: paths.directory }]
        : [],
      stopListener: async () => assert.fail('must not stop an unrelated listener'),
      cleanupProvider: async () => { providerCleanupCount += 1 },
      removeProfilePlugin: async () => assert.fail('must not mutate the Profile'),
      writeLine: () => {},
    }),
    /端口 3083.*不属于当前 Workshop/,
  )
  assert.equal(providerCleanupCount, 0)
})

test('reset refuses to remove a Provider block when its recovery state is missing', async t => {
  const paths = await fixture()
  t.after(() => rm(paths.directory, { recursive: true, force: true }))
  await writeFile(
    resolve(paths.profileDirectory, 'cordis.patch.yml'),
    '# >>> dsh-workshop:provider-hmr >>>\n- insert: []\n# <<< dsh-workshop:provider-hmr <<<\n',
    'utf8',
  )
  let providerCleanupCount = 0

  await assert.rejects(
    resetWorkshopState({
      repositoryRoot: paths.repositoryRoot,
      profileDirectory: paths.profileDirectory,
      providerStatePath: resolve(paths.directory, 'missing-provider-state.json'),
      inspectPort: async () => [],
      stopListener: async () => assert.fail('there are no listeners'),
      cleanupProvider: async () => { providerCleanupCount += 1 },
      removeProfilePlugin: async () => assert.fail('must not mutate the Profile'),
      writeLine: () => {},
    }),
    /恢复状态已丢失.*拒绝自动清理/,
  )
  assert.equal(providerCleanupCount, 0)
})
