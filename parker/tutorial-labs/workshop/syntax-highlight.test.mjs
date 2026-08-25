import assert from 'node:assert/strict'
import test from 'node:test'

import { highlightContent, highlightTerminalLine } from './chapters/syntax-highlight.mjs'

test('highlights TypeScript, YAML, and Shell with their own token sets', () => {
  const typeScript = highlightContent("export const name = 'hello' // ready", {
    file: 'plugin.ts',
    kind: 'TypeScript · 写入文件',
  })
  assert.match(typeScript, /token-keyword/)
  assert.match(typeScript, /token-string/)
  assert.match(typeScript, /token-comment/)

  const yaml = highlightContent("- insert:\n    - id: hello\n      enabled: true", {
    file: 'cordis.yml',
    kind: 'YAML · 写入文件',
  })
  assert.match(yaml, /token-property/)
  assert.match(yaml, /token-punctuation/)
  assert.match(yaml, /token-literal/)

  const shell = highlightContent('pnpm dsh web --patch ./plugin/cordis.yml --port 3082', {
    file: 'Terminal / 127.0.0.1:3082',
    kind: '终端 · 持续运行',
  })
  assert.match(shell, /token-shell-command/)
  assert.match(shell, /token-shell-reference/)
  assert.match(shell, /token-shell-flag/)
  assert.match(shell, /token-number/)
})

test('highlights commands and validation labels inside mixed HTTP content', () => {
  const html = highlightContent([
    'curl -fsS --max-time 5 http://127.0.0.1:3082/',
    '',
    '终端验收： [hello-plugin] plugin loaded!',
    '页面验收： HTTP 页面访问成功',
  ].join('\n'), {
    file: 'http://127.0.0.1:3082/',
    kind: 'HTTP · 页面验收',
  })

  assert.match(html, /token-shell-command[^>]*>curl/)
  assert.match(html, /token-shell-flag[^>]*>-fsS/)
  assert.match(html, /token-url/)
  assert.equal((html.match(/token-label/g) ?? []).length, 2)
})

test('highlights HMR differences and instructional lists without treating them as YAML', () => {
  const diff = highlightContent([
    'apiKey:',
    '  demo-key-BEFORE-HMR-OLD1',
    '  → demo-key-AFTER-HMR-NEW2',
  ].join('\n'), {
    file: 'cordis.patch.yml',
    kind: 'HMR · 热更新',
  })
  assert.match(diff, /token-diff-before/)
  assert.match(diff, /token-diff-arrow/)
  assert.match(diff, /token-diff-after/)

  const instructions = highlightContent([
    '页面验收：',
    '1. 找到任务看板',
    '2. 新会话仍可选择模型',
  ].join('\n'), {
    file: 'Terminal / 127.0.0.1:3086',
    kind: 'Web UI · 持续运行',
  })
  assert.match(instructions, /token-section/)
  assert.equal((instructions.match(/token-list-index/g) ?? []).length, 2)
})

test('every workshop content category receives semantic highlighting', () => {
  const samples = [
    ['Profile · 查看配置', 'ls -la ~/.dsh/profiles/web'],
    ['Profile Patch · 实时写入', '- insert:\n    - id: provider'],
    ['Profile · 恢复配置', 'node provider-profile.mjs cleanup'],
    ['npm 包 · 查看结构', '# Bundle Patch\n- insert:'],
    ['构建与测试 · 实时执行', 'pnpm --filter plugin test'],
    ['npm pack · 实时执行', 'pnpm pack:running-ant'],
    ['压缩包 · 检查内容', 'tar -tzf plugin.tgz'],
    ['插件安装 · 实时执行', 'pnpm dsh plugin --profile web add file:plugin.tgz'],
    ['npm 发布 · 模拟检查', 'pnpm publish --dry-run --access public'],
    ['安全与仓库 · 发布说明', '仓库：https://github.com/example/plugin'],
    ['Cordis 配置 · 实时检查', 'pnpm dsh --profile web --dump-config'],
    ['插件卸载 · 实时执行', 'pnpm dsh plugin --profile web remove plugin'],
  ]

  for (const [kind, source] of samples) {
    assert.match(highlightContent(source, { file: 'workshop', kind }), /class="token-/, kind)
  }
})

test('highlights real commands inside streamed terminal output', () => {
  const command = highlightTerminalLine('$ node --import tsx/esm apps/cli/src/bin.ts web --patch ./plugin/cordis.yml --port 3082')
  assert.match(command, /token-terminal-prompt/)
  assert.match(command, /token-shell-command[^>]*>node/)
  assert.match(command, /token-shell-flag[^>]*>--import/)
  assert.match(command, /token-shell-reference[^>]*>\.\/plugin\/cordis\.yml/)
  assert.match(command, /token-number[^>]*>3082/)

  const header = highlightTerminalLine('$ [chapter-03-plugins.hello.web] 使用 Hello Patch 启动 Web')
  assert.match(header, /token-terminal-prompt/)
  assert.match(header, /token-concept/)
})
