import { randomBytes, timingSafeEqual } from 'node:crypto'
import { createReadStream, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../../..')
const workshopHtml = resolve(repositoryRoot, 'parker/docs/labs/plugin-lab.html')
const host = '127.0.0.1'
const port = Number.parseInt(process.env.WORKSHOP_PORT ?? '3090', 10)
const origin = `http://${host}:${port}`
const token = randomBytes(24).toString('hex')

const actions = new Map([
  ['1.1', command('检查三行烟花 apply', "sed -n '/export function apply/,/^}/p' parker/ds_plugin/plugins/dsh-fireworks/src/client/index.ts")],
  ['1.2', command('确认烟花插件已启用', "pnpm dsh --profile web --dump-config | sed -n '/# == dsh-fireworks/,+4p'")],
  ['1.3', command('启动烟花插件 Web', webCommand(3082))],
  ['1.4', command('验收烟花插件页面', `${pageCheckCommand(3082)}\nprintf '\n页面已就绪：输入框上方应显示一个 32px 的 🎆。\n'`)],

  ['2.1', write('写入 Service Provider', 'parker/tutorial-labs/plugin-workshop/02-greeter-tool/src/greeter.ts')],
  ['2.2', write('写入工具 Consumer', 'parker/tutorial-labs/plugin-workshop/02-greeter-tool/src/greet-tool.ts')],
  ['2.3', write('写入事件 Observer', 'parker/tutorial-labs/plugin-workshop/02-greeter-tool/src/tool-logger.ts')],
  ['2.4', write('写入工具实验 Patch', 'parker/tutorial-labs/plugin-workshop/02-greeter-tool/cordis.patch.yml')],
  ['2.5', command('验证缺少 Provider 的 PENDING 状态', 'cd parker/tutorial-labs/plugin-workshop/02-greeter-tool/smoke-missing && node --import tsx ../../../../../vendor/cordis/bin.js')],
  ['2.6', command('执行零费用工具 Smoke', 'cd parker/tutorial-labs/plugin-workshop/02-greeter-tool/smoke && node --import tsx ../../../../../vendor/cordis/bin.js')],
  ['2.7', command('启动工具插件 Web', webCommand(3083, '--patch ./parker/tutorial-labs/plugin-workshop/02-greeter-tool/cordis.patch.yml'))],
  ['2.8', command('验收工具插件页面', `${pageCheckCommand(3083)}\nprintf '\\n页面已就绪。请在 Chat 中发送 Workshop 给出的提示词；工具调用日志会出现在 2.7 的运行终端中。\\n'`)],

  ['3.1', command('检查插件包声明', "node -e \"const p=require('./parker/ds_plugin/plugins/dsh-running-ant/package.json'); console.log(JSON.stringify({name:p.name,version:p.version,dsh:p.dsh},null,2))\"")],
  ['3.2', command('检查 Host 入口', "sed -n '1,120p' parker/ds_plugin/plugins/dsh-running-ant/src/index.ts")],
  ['3.3', command('检查 Client Slot 注册', "sed -n '1,180p' parker/ds_plugin/plugins/dsh-running-ant/src/client/index.ts")],
  ['3.4', command('检查 React 运行状态组件', "sed -n '1,220p' parker/ds_plugin/plugins/dsh-running-ant/src/client/RunningAnt.tsx")],
  ['3.5', command('检查 Bundle Patch', "cat parker/ds_plugin/plugins/dsh-running-ant/cordis.patch.yml")],
  ['3.6', command('构建、测试并打包蓝色蚂蚁', 'cd parker/ds_plugin && pnpm --filter dsh-running-ant build && pnpm --filter dsh-running-ant test && pnpm pack:running-ant')],
  ['3.7', command('安装蓝色蚂蚁到 Web Profile', 'pnpm dsh plugin --profile web add file:' + resolve(repositoryRoot, 'parker/ds_plugin/dist/dsh-running-ant-0.1.0.tgz') + " && pnpm dsh --profile web --dump-config | sed -n '/# == dsh-running-ant/,+4p'")],
  ['3.8', command('启动并验收蓝色蚂蚁 Web', webCommand(3080))],

  ['4.1', command('审查 dsh-find-plugin 安装包', "node -e \"const p=require(process.env.HOME+'/.dsh/profiles/web/node_modules/dsh-find-plugin/package.json'); console.log(JSON.stringify({name:p.name,version:p.version,license:p.license,repository:p.repository,dsh:p.dsh},null,2))\"")],
  ['4.2', command('安装 dsh-find-plugin', 'pnpm dsh plugin --profile web add dsh-find-plugin')],
  ['4.3', command('检查 dsh-find-plugin 最终组合', "pnpm dsh --profile web --dump-config | sed -n '/# == dsh-find-plugin/,+4p'")],
  ['4.4', command('验收 dsh-find-plugin 页面', `${pageCheckCommand(3080)}\nprintf '\\n页面已就绪。请发送 Workshop 给出的找插件提示词。\\n'`)],

  ['5.1', command('审查 Web UI 聚合包', "node -e \"const p=require(process.env.HOME+'/.dsh/profiles/web/node_modules/@linxin666/dsh-web-ui-all/package.json'); console.log(JSON.stringify({name:p.name,version:p.version,license:p.license,repository:p.repository,dsh:p.dsh},null,2))\"")],
  ['5.2', command('安装 Web UI 聚合包', 'pnpm dsh plugin --profile web add @linxin666/dsh-web-ui-all')],
  ['5.3', command('检查 Web UI 最终组合', "pnpm dsh --profile web --dump-config | sed -n '/# == @linxin666\\/dsh-web-ui-all/,+30p'")],
  ['5.4', command('启动并验收完整 Web UI', webCommand(3080))],
])

function command(label, shellCommand) {
  return { type: 'command', label, shellCommand }
}

function write(label, relativePath) {
  return { type: 'write', label, relativePath }
}

function webCommand(webPort, extraArguments = '') {
  return `if lsof -nP -iTCP:${webPort} -sTCP:LISTEN >/dev/null 2>&1; then
  echo '端口 ${webPort} 已有服务运行：'
  lsof -nP -iTCP:${webPort} -sTCP:LISTEN
  ${pageCheckCommand(webPort)}
else
  exec pnpm dsh web ${extraArguments} --port ${webPort}
fi`
}

function pageCheckCommand(webPort) {
  return `html=$(curl -fsS --max-time 5 http://127.0.0.1:${webPort}/) && printf '%s\\n' "$html" | grep -o '<title>[^<]*</title>' | head -n 1 && echo 'HTTP 页面访问成功：http://127.0.0.1:${webPort}/'`
}

function isAuthorized(request) {
  const requestOrigin = request.headers.origin
  if (requestOrigin !== origin) return false
  const supplied = request.headers['x-workshop-token']
  if (typeof supplied !== 'string' || supplied.length !== token.length) return false
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(token))
}

function resolveInsideRepository(relativePath) {
  const target = resolve(repositoryRoot, relativePath)
  if (target !== repositoryRoot && !target.startsWith(repositoryRoot + sep)) {
    throw new Error('目标路径超出仓库范围')
  }
  return target
}

async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 256 * 1024) throw new Error('请求内容过大')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  response.end(JSON.stringify(value))
}

async function executeAction(request, response, actionId) {
  if (!isAuthorized(request)) {
    sendJson(response, 403, { error: 'Workshop 会话验证失败' })
    return
  }
  const action = actions.get(actionId)
  if (!action) {
    sendJson(response, 404, { error: `未知步骤动作：${actionId}` })
    return
  }
  const body = await readJson(request)
  response.writeHead(200, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  response.write(`$ [${actionId}] ${action.label}\n`)
  if (action.type === 'write') {
    if (typeof body.content !== 'string') throw new Error('该步骤缺少待写入内容')
    const target = resolveInsideRepository(action.relativePath)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, body.content.endsWith('\n') ? body.content : body.content + '\n', 'utf8')
    response.write(`已写入 ${action.relativePath}\n`)
    response.write(`字节数：${Buffer.byteLength(body.content, 'utf8')}\n`)
    response.end('退出码：0\n')
    return
  }
  response.write(`${action.shellCommand}\n\n`)
  const child = spawn('/bin/zsh', ['-lc', action.shellCommand], {
    cwd: repositoryRoot,
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let closed = false
  const stop = () => {
    if (closed || child.killed) return
    child.kill('SIGTERM')
    setTimeout(() => child.kill('SIGKILL'), 1500).unref()
  }
  response.on('close', stop)
  child.stdout.pipe(response, { end: false })
  child.stderr.pipe(response, { end: false })
  child.on('error', error => {
    if (!response.writableEnded) response.end(`\n执行失败：${error.message}\n`)
  })
  child.on('close', (code, signal) => {
    closed = true
    if (!response.writableEnded) {
      response.end(`\n退出码：${code ?? 'null'}${signal ? `，信号：${signal}` : ''}\n`)
    }
  })
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', origin)
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/plugin-lab.html')) {
      const html = readFileSync(workshopHtml, 'utf8').replace(
        '</head>',
        `<script>globalThis.__WORKSHOP_EXECUTOR__=${JSON.stringify({ origin, token })}</script></head>`,
      )
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'content-security-policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:",
      })
      response.end(html)
      return
    }
    if (request.method === 'POST' && url.pathname.startsWith('/api/actions/')) {
      await executeAction(request, response, decodeURIComponent(url.pathname.slice('/api/actions/'.length)))
      return
    }
    if (request.method === 'GET' && url.pathname.startsWith('/assets/')) {
      const target = resolveInsideRepository('parker/docs/labs/' + url.pathname.slice('/assets/'.length))
      response.writeHead(200, { 'content-type': contentType(target), 'cache-control': 'no-store' })
      createReadStream(target).pipe(response)
      return
    }
    sendJson(response, 404, { error: 'Not found' })
  } catch (error) {
    if (!response.headersSent) sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) })
    else if (!response.writableEnded) response.end(`\n执行服务错误：${error instanceof Error ? error.message : String(error)}\n`)
  }
})

function contentType(path) {
  switch (extname(path)) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    default: return 'application/octet-stream'
  }
}

server.listen(port, host, () => {
  console.log(`Workshop: ${origin}`)
  console.log('每个步骤只执行服务端预先绑定的固定动作；按 Ctrl+C 停止。')
})
