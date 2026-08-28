import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { cleanup as cleanupProviderExperiment } from './provider-profile.mjs'

const workshopPorts = [3090, 3082, 3083, 3084, 3085, 3086]
const communityPackage = '@linxin666/dsh-web-ui-all'
const communityWorkshopSpecs = new Set(['0.2.6', '^0.2.6', '~0.2.6'])

/**
 * Remove state owned by the plugin Workshop before its HTTP server starts.
 *
 * @param {object} options - Cleanup paths and injectable process operations.
 * @returns {Promise<{removedPlugins: string[], restoredProvider: boolean, stoppedPorts: number[]}>} Cleanup summary.
 */
export async function resetWorkshopState({
  repositoryRoot,
  profileDirectory = resolve(homedir(), '.dsh/profiles/web'),
  providerStatePath = resolve(homedir(), '.dsh/.workshop-state/provider-hmr.json'),
  inspectPort = inspectPortListeners,
  stopListener = stopOwnedListener,
  cleanupProvider = cleanupProviderExperiment,
  removeProfilePlugin = packageName => removePlugin(repositoryRoot, packageName),
  writeLine = line => console.log(line),
}) {
  if (!repositoryRoot) throw new Error('Workshop 启动清理缺少仓库路径。')

  const ownedListeners = []
  for (const port of workshopPorts) {
    const listeners = await inspectPort(port)
    for (const listener of listeners) {
      if (!isOwnedListener(repositoryRoot, port, listener)) {
        throw new Error(`端口 ${port} 被 PID ${listener.pid} 占用，但该进程不属于当前 Workshop；请先自行处理该进程。`)
      }
      ownedListeners.push({ ...listener, port })
    }
  }

  writeLine('Workshop 启动清理：')
  const stoppedPorts = []
  for (const listener of ownedListeners) {
    await stopListener(listener)
    if (!stoppedPorts.includes(listener.port)) stoppedPorts.push(listener.port)
    writeLine(`- 已停止上次实验进程：${listener.port}`)
  }

  const providerPatchPath = resolve(profileDirectory, 'cordis.patch.yml')
  const providerStateExists = existsSync(providerStatePath)
  const providerCleanup = await cleanupProvider({ patchPath: providerPatchPath, statePath: providerStatePath })
  const restoredProvider = providerCleanup?.cleaned ?? providerStateExists
  if (providerCleanup?.recovery === 'marked-block') writeLine('- 已移除遗留的实验三 Provider 配置')
  else if (restoredProvider) writeLine('- 已恢复实验三开始前的 Web Profile Patch')

  const removedPlugins = []
  const manifestPath = resolve(profileDirectory, 'package.json')
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    const dependencies = manifest.dependencies ?? {}
    const antArchive = resolve(repositoryRoot, 'parker/ds_plugin/dist/dsh-running-ant-0.1.0.tgz')
    if (isWorkshopArchive(dependencies['dsh-running-ant'], profileDirectory, antArchive)) {
      await removeProfilePlugin('dsh-running-ant')
      removedPlugins.push('dsh-running-ant')
      writeLine('- 已卸载实验四的 dsh-running-ant')
    }
    if (communityWorkshopSpecs.has(dependencies[communityPackage])) {
      await removeProfilePlugin(communityPackage)
      removedPlugins.push(communityPackage)
      writeLine(`- 已卸载实验五的 ${communityPackage}`)
    }
  }

  if (stoppedPorts.length === 0 && !restoredProvider && removedPlugins.length === 0) {
    writeLine('- 未发现上次实验残留')
  }
  writeLine('Workshop 实验环境已就绪。')
  return { stoppedPorts, restoredProvider, removedPlugins }
}

function isWorkshopArchive(spec, profileDirectory, expectedArchive) {
  if (typeof spec !== 'string' || !spec.startsWith('file:')) return false
  return resolve(profileDirectory, spec.slice('file:'.length)) === expectedArchive
}

function isOwnedListener(repositoryRoot, port, listener) {
  if (resolve(listener.cwd) !== resolve(repositoryRoot)) return false
  if (port === 3090) {
    const serverPath = resolve(repositoryRoot, 'parker/tutorial-labs/workshop/workshop-server.mjs')
    return listener.command.includes(serverPath)
      || listener.command.includes('parker/tutorial-labs/workshop/workshop-server.mjs')
  }
  return listener.command.includes('apps/cli/src/bin.ts web')
    && (listener.command.includes(`--port ${port}`) || listener.command.includes(`--port=${port}`))
}

async function inspectPortListeners(port) {
  const result = await runFile('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fp'], { allowedExitCodes: [0, 1] })
  const pids = [...new Set(result.stdout.split('\n')
    .filter(line => /^p\d+$/.test(line))
    .map(line => Number.parseInt(line.slice(1), 10)))]
  const listeners = []
  for (const pid of pids) {
    const listener = await describeProcess(pid)
    if (listener) listeners.push(listener)
  }
  return listeners
}

async function describeProcess(pid) {
  const commandResult = await runFile('ps', ['-ww', '-p', String(pid), '-o', 'command='], { allowedExitCodes: [0, 1] })
  if (commandResult.exitCode !== 0 || commandResult.stdout.trim() === '') return undefined
  const cwdResult = await runFile('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], { allowedExitCodes: [0, 1] })
  if (cwdResult.exitCode !== 0) return undefined
  const cwd = cwdResult.stdout.split('\n').find(line => line.startsWith('n'))?.slice(1)
  if (!cwd) return undefined
  return { pid, command: commandResult.stdout.trim(), cwd }
}

async function stopOwnedListener(listener) {
  const current = await describeProcess(listener.pid)
  if (!current) return
  if (current.command !== listener.command || resolve(current.cwd) !== resolve(listener.cwd)) {
    throw new Error(`PID ${listener.pid} 在清理前发生变化，Workshop 拒绝终止该进程。`)
  }
  try {
    process.kill(listener.pid, 'SIGTERM')
  } catch (error) {
    if (error?.code === 'ESRCH') return
    throw error
  }
  if (await waitForExit(listener.pid, 2500)) return
  process.kill(listener.pid, 'SIGKILL')
  if (!await waitForExit(listener.pid, 1000)) {
    throw new Error(`PID ${listener.pid} 在 SIGKILL 后仍未退出。`)
  }
}

async function waitForExit(pid, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      process.kill(pid, 0)
    } catch (error) {
      if (error?.code === 'ESRCH') return true
      throw error
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 50))
  }
  return false
}

async function removePlugin(repositoryRoot, packageName) {
  await runFile('pnpm', ['dsh', 'plugin', '--profile', 'web', 'remove', packageName], { cwd: repositoryRoot })
}

function scrubEnvironment() {
  return Object.fromEntries(Object.entries(process.env)
    .filter(([name]) => !/(?:KEY|SECRET|TOKEN|PASSWORD)/i.test(name)))
}

async function runFile(file, args, { cwd, allowedExitCodes = [0] } = {}) {
  return await new Promise((resolveRun, rejectRun) => {
    const child = spawn(file, args, {
      cwd,
      env: scrubEnvironment(),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', chunk => { stdout = `${stdout}${chunk}`.slice(-64 * 1024) })
    child.stderr.on('data', chunk => { stderr = `${stderr}${chunk}`.slice(-64 * 1024) })
    child.on('error', rejectRun)
    child.on('close', (exitCode, signal) => {
      const result = { exitCode, signal, stdout, stderr }
      if (exitCode !== null && allowedExitCodes.includes(exitCode)) resolveRun(result)
      else rejectRun(new Error(`${file} 执行失败：退出码 ${exitCode ?? 'null'}${signal ? `，信号 ${signal}` : ''}`))
    })
  })
}
