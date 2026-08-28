import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../../../../..')
const defaultPatchPath = resolve(homedir(), '.dsh/profiles/web/cordis.patch.yml')
const defaultStatePath = resolve(homedir(), '.dsh/.workshop-state/provider-hmr.json')
const startMarker = '# >>> dsh-workshop:provider-hmr >>>'
const endMarker = '# <<< dsh-workshop:provider-hmr <<<'

export const before = {
  apiKey: 'demo-key-BEFORE-HMR-OLD1',
  baseURL: 'https://provider-before-hot-reload.invalid/api/v1/legacy-region',
}

export const after = {
  apiKey: 'demo-key-AFTER-HMR-NEW2',
  baseURL: 'https://provider-after-hot-reload.invalid/api/v2/new-region',
}

function hash(content) {
  return createHash('sha256').update(content).digest('hex')
}

function experimentPatch(values) {
  const providerPath = resolve(repositoryRoot, 'parker/tutorial-labs/plugin-workshop/03-provider-config-hmr/mock-provider.ts')
  const consumerPath = resolve(repositoryRoot, 'parker/tutorial-labs/plugin-workshop/03-provider-config-hmr/provider-consumer.ts')
  return `${startMarker}
- insert:
    - id: tutorial-mock-provider
      name: '${providerPath}'
      config:
        apiKey: '${values.apiKey}'
        baseURL: '${values.baseURL}'
    - id: tutorial-provider-consumer
      name: '${consumerPath}'
${endMarker}
`
}

function appendExperiment(originalContent, values) {
  const lines = originalContent.split('\n')
  const semanticLines = lines.filter(line => line.trim() !== '' && !line.trimStart().startsWith('#'))
  const prefixContent = semanticLines.length === 1 && semanticLines[0].trim() === '[]'
    ? lines.filter(line => line.trim() !== '[]').join('\n')
    : originalContent
  const prefix = prefixContent.length === 0 || prefixContent.endsWith('\n') ? prefixContent : `${prefixContent}\n`
  return `${prefix}${prefix.length === 0 ? '' : '\n'}${experimentPatch(values)}`
}

function recoverMarkedExperiment(current) {
  const startCount = current.split(startMarker).length - 1
  const endCount = current.split(endMarker).length - 1
  if (startCount === 0 && endCount === 0) return undefined
  if (startCount !== 1 || endCount !== 1) {
    throw new Error('Provider 实验区块标记不完整或重复，无法确认 Workshop 写入的范围；拒绝自动清理。')
  }

  const knownBlocks = [experimentPatch(before), experimentPatch(after)]
  const block = knownBlocks.find(candidate => current.includes(candidate))
  if (!block) {
    throw new Error('Provider 实验区块内容与 Workshop 生成结果不一致，无法确认配置归属；拒绝自动清理。')
  }

  const recovered = current.replace(block, '')
  const semanticLines = recovered.split('\n')
    .filter(line => line.trim() !== '' && !line.trimStart().startsWith('#'))
  if (semanticLines.length > 0) return recovered
  const comments = recovered.trimEnd()
  return `${comments}${comments.length === 0 ? '' : '\n'}[]\n`
}

async function atomicWrite(path, content) {
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.workshop-${process.pid}-${Date.now()}`
  await writeFile(temporary, content, 'utf8')
  await rename(temporary, path)
}

async function readState(statePath) {
  return JSON.parse(await readFile(statePath, 'utf8'))
}

async function assertCurrent(state, patchPath) {
  if (resolve(state.patchPath) !== resolve(patchPath)) {
    throw new Error(`状态文件属于另一个 Patch：${state.patchPath}`)
  }
  const current = await readFile(patchPath, 'utf8')
  if (hash(current) !== state.expectedHash) {
    throw new Error(`检测到 ${patchPath} 被其他操作修改；为避免覆盖你的配置，本实验拒绝继续。请手工处理带 dsh-workshop 标记的区块。`)
  }
  return current
}

export async function applyV1({ patchPath = defaultPatchPath, statePath = defaultStatePath } = {}) {
  if (existsSync(statePath)) {
    const state = await readState(statePath)
    const current = await assertCurrent(state, patchPath)
    if (state.phase === 'v1') {
      console.log('第一组实验参数已经加入 Web Profile，无需重复写入。')
      return
    }
    if (state.phase !== 'v2') throw new Error(`无法识别实验状态：${state.phase}`)
    const nextContent = current
      .replace(after.apiKey, before.apiKey)
      .replace(after.baseURL, before.baseURL)
    if (nextContent === current || nextContent.includes(after.apiKey) || nextContent.includes(after.baseURL)) {
      throw new Error('没有完整找到第二组 Provider 参数，拒绝重置。')
    }
    await atomicWrite(patchPath, nextContent)
    await atomicWrite(statePath, `${JSON.stringify({ ...state, expectedHash: hash(nextContent), phase: 'v1' }, null, 2)}\n`)
    console.log(`已将 ${patchPath} 重置为第一组实验参数`)
    console.log(`apiKey=${before.apiKey}`)
    console.log(`baseURL=${before.baseURL}`)
    console.log('Web 已在运行时，这次写入也会触发 Cordis 热更新。')
    return
  }
  const existed = existsSync(patchPath)
  const originalContent = existed ? await readFile(patchPath, 'utf8') : ''
  if (originalContent.includes(startMarker) || originalContent.includes(endMarker)) {
    throw new Error('Patch 中已存在 Provider Workshop 标记；请先检查并清理该区块。')
  }
  const nextContent = appendExperiment(originalContent, before)
  await atomicWrite(patchPath, nextContent)
  await atomicWrite(statePath, `${JSON.stringify({ patchPath, existed, originalContent, expectedHash: hash(nextContent), phase: 'v1' }, null, 2)}\n`)
  console.log(`已写入 ${patchPath}`)
  console.log(`apiKey=${before.apiKey}`)
  console.log(`baseURL=${before.baseURL}`)
  console.log('下一步启动 Web；Cordis Loader 会监听这个 Profile Patch。')
}

export async function updateV2({ patchPath = defaultPatchPath, statePath = defaultStatePath } = {}) {
  if (!existsSync(statePath)) throw new Error('尚未执行 apply-v1，不能进行热更新。')
  const state = await readState(statePath)
  const current = await assertCurrent(state, patchPath)
  if (state.phase === 'v2') {
    if (!current.includes(after.apiKey) || !current.includes(after.baseURL)) {
      throw new Error('状态记录为第二组，但 Patch 中没有完整的第二组 Provider 参数。')
    }
    console.log('第二组实验参数已经生效，无需重复更新。')
    console.log(`apiKey=${after.apiKey}`)
    console.log(`baseURL=${after.baseURL}`)
    return
  }
  if (state.phase !== 'v1') throw new Error(`无法识别实验状态：${state.phase}`)
  const nextContent = current
    .replace(before.apiKey, after.apiKey)
    .replace(before.baseURL, after.baseURL)
  if (nextContent === current || nextContent.includes(before.apiKey) || nextContent.includes(before.baseURL)) {
    throw new Error('没有完整找到第一组 Provider 参数，拒绝写入。')
  }
  await atomicWrite(patchPath, nextContent)
  await atomicWrite(statePath, `${JSON.stringify({ ...state, expectedHash: hash(nextContent), phase: 'v2' }, null, 2)}\n`)
  console.log(`已原地修改 ${patchPath}`)
  console.log(`${before.apiKey}  ->  ${after.apiKey}`)
  console.log(`${before.baseURL}  ->  ${after.baseURL}`)
  console.log('请切回“启动完整 Web”步骤，观察 Provider dispose、重新 loaded 与 Consumer 重连日志。')
}

export async function cleanup({ patchPath = defaultPatchPath, statePath = defaultStatePath } = {}) {
  if (!existsSync(statePath)) {
    if (existsSync(patchPath)) {
      const current = await readFile(patchPath, 'utf8')
      const recovered = recoverMarkedExperiment(current)
      if (recovered !== undefined) {
        await atomicWrite(patchPath, recovered)
        console.log(`已移除 ${patchPath} 中遗留的 Provider Workshop 配置`)
        console.log('Web 仍在运行时，Cordis 会卸载模拟 Provider 与 Consumer。')
        return { cleaned: true, recovery: 'marked-block' }
      }
    }
    console.log('没有待恢复的 Provider Workshop 配置。')
    return { cleaned: false, recovery: 'none' }
  }
  const state = await readState(statePath)
  await assertCurrent(state, patchPath)
  if (state.existed) await atomicWrite(patchPath, state.originalContent)
  else await rm(patchPath, { force: true })
  await rm(statePath, { force: true })
  console.log(`已恢复 ${patchPath}`)
  console.log('Web 仍在运行时，Cordis 会卸载模拟 Provider 与 Consumer。')
  return { cleaned: true, recovery: 'snapshot' }
}

async function main() {
  const operation = process.argv[2]
  if (operation === 'apply-v1') await applyV1()
  else if (operation === 'update-v2') await updateV2()
  else if (operation === 'cleanup') await cleanup()
  else throw new Error('用法：node provider-profile.mjs <apply-v1|update-v2|cleanup>')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
