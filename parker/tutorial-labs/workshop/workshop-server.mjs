import { spawn } from 'node:child_process'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { createReadStream, readFileSync } from 'node:fs'
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chapter03Actions } from './chapters/chapter-03-plugins/actions.mjs'
import { resetWorkshopState } from './chapters/chapter-03-plugins/reset.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../../..')
await resetWorkshopState({ repositoryRoot })
const host = '127.0.0.1'
const port = Number.parseInt(process.env.WORKSHOP_PORT ?? '3090', 10)
const origin = `http://${host}:${port}`
const token = randomBytes(24).toString('hex')
const actions = new Map(chapter03Actions(repositoryRoot).map(action => [action.id, action]))

function isAuthorized(request) {
  if (request.headers.origin !== origin) return false
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

function resolveStaticAsset(pathname) {
  const target = resolve(scriptDirectory, pathname)
  if (target !== scriptDirectory && !target.startsWith(scriptDirectory + sep)) {
    throw new Error('静态资源路径超出 Workshop 目录')
  }
  return target
}

async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 256 * 1024) throw new Error('请求内容超过 256 KiB')
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
    sendJson(response, 403, { error: 'Workshop 会话验证失败，请从本地 Workshop 地址重新打开页面' })
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
    await writeFile(target, body.content.endsWith('\n') ? body.content : `${body.content}\n`, 'utf8')
    response.end(`已写入 ${action.relativePath}\n字节数：${Buffer.byteLength(body.content, 'utf8')}\n\n退出码：0\n`)
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
    if (request.method === 'GET' && url.pathname === '/') {
      const html = readFileSync(resolve(scriptDirectory, 'index.html'), 'utf8').replace(
        '</head>',
        `<script>globalThis.__WORKSHOP_EXECUTOR__=${JSON.stringify({ origin, token, repositoryRoot })}</script></head>`,
      )
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'content-security-policy': "default-src 'self'; style-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self'",
      })
      response.end(html)
      return
    }
    if (request.method === 'POST' && url.pathname.startsWith('/api/actions/')) {
      await executeAction(request, response, decodeURIComponent(url.pathname.slice('/api/actions/'.length)))
      return
    }
    if (request.method === 'GET') {
      if (url.pathname !== '/app.js' && url.pathname !== '/styles.css' && !url.pathname.startsWith('/chapters/')) {
        sendJson(response, 404, { error: 'Not found' })
        return
      }
      const target = resolveStaticAsset(url.pathname.slice(1))
      if (!['.js', '.mjs', '.css', '.png', '.svg'].includes(extname(target))) {
        sendJson(response, 404, { error: 'Not found' })
        return
      }
      if (!(await stat(target)).isFile()) {
        sendJson(response, 404, { error: 'Not found' })
        return
      }
      response.writeHead(200, {
        'content-type': contentType(target),
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      })
      createReadStream(target).pipe(response)
      return
    }
    sendJson(response, 404, { error: 'Not found' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!response.headersSent) sendJson(response, 500, { error: message })
    else if (!response.writableEnded) response.end(`\n执行服务错误：${message}\n`)
  }
})

function contentType(path) {
  switch (extname(path)) {
    case '.js':
    case '.mjs': return 'text/javascript; charset=utf-8'
    case '.css': return 'text/css; charset=utf-8'
    case '.png': return 'image/png'
    case '.svg': return 'image/svg+xml'
    default: return 'application/octet-stream'
  }
}

server.listen(port, host, () => {
  console.log(`Workshop: ${origin}`)
  console.log(`已注册 ${actions.size} 个固定动作；按 Ctrl+C 停止。`)
})
