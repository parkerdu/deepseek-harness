/** Escapes Workshop text before inserting syntax-highlight markup. */
export function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function highlightTypeScript(source) {
  const pattern = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:import|from|export|const|let|function|return|async|await|type|interface|extends|new|throw|if|else|for|of|true|false|null|undefined)\b|\b(?:Context|String|Number|Boolean|Promise)\b|\b\d+(?:\.\d+)?\b)/g
  return source.split(pattern).map(token => {
    if (!token) return ''
    let className = ''
    if (/^(?:\/\/|\/\*)/.test(token)) className = 'comment'
    else if (/^['"`]/.test(token)) className = 'string'
    else if (/^(?:Context|String|Number|Boolean|Promise)$/.test(token)) className = 'type'
    else if (/^\d/.test(token)) className = 'number'
    else if (/^(?:true|false|null|undefined)$/.test(token)) className = 'literal'
    else className = 'keyword'
    return `<span class="token-${className}">${escapeHtml(token)}</span>`
  }).join('')
}

function highlightYamlScalar(value) {
  const pattern = /('(?:''|[^'])*'|"(?:\\.|[^"\\])*"|#[^\n]*|\b(?:true|false|null|yes|no|on|off)\b|\b\d+(?:\.\d+)?\b)/gi
  let html = ''
  let offset = 0
  for (const match of value.matchAll(pattern)) {
    html += `<span class="token-yaml-value">${escapeHtml(value.slice(offset, match.index))}</span>`
    const token = match[0]
    let className = 'literal'
    if (token.startsWith('#')) className = 'comment'
    else if (/^['"]/.test(token)) className = 'string'
    else if (/^\d/.test(token)) className = 'number'
    html += `<span class="token-${className}">${escapeHtml(token)}</span>`
    offset = match.index + token.length
  }
  html += `<span class="token-yaml-value">${escapeHtml(value.slice(offset))}</span>`
  return html
}

function highlightYaml(source) {
  return source.split('\n').map(line => {
    const entry = line.match(/^(\s*)(-\s+)?([^:#][^:]*?)(:\s*)(.*)$/)
    if (!entry) return highlightYamlScalar(line)
    const [, indent, dash = '', key, colon, value] = entry
    return [
      escapeHtml(indent),
      dash ? `<span class="token-punctuation">${escapeHtml(dash)}</span>` : '',
      `<span class="token-property">${escapeHtml(key)}</span>`,
      `<span class="token-punctuation">${escapeHtml(colon)}</span>`,
      highlightYamlScalar(value),
    ].join('')
  }).join('\n')
}

function highlightShell(source) {
  const pattern = /(--patch)(\s+)(\S+)|(https?:\/\/[A-Za-z0-9./?=&_%#@:+~-]+)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|#[^\n]*|\b(?:cd|pnpm|node|exec|curl|lsof|grep|ls|tar|test|sed|printf|npm|head|echo|if|then|else|fi)\b|--?[A-Za-z][\w-]*|(?:\.{1,2}\/|~\/|\/)[^\s'"]+|@[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+(?:@[^\s'"]+)?|\b\d+(?:\.\d+)*\b|&&|\|\||\||>>?|<</g
  let html = ''
  let offset = 0
  for (const match of source.matchAll(pattern)) {
    html += escapeHtml(source.slice(offset, match.index))
    if (match[1]) {
      html += `<span class="token-shell-flag token-shell-patch">${escapeHtml(match[1])}</span>`
      html += escapeHtml(match[2])
      html += `<span class="token-shell-reference">${escapeHtml(match[3])}</span>`
    } else {
      const token = match[0]
      let className = 'shell-command'
      if (token.startsWith('http')) className = 'url'
      else if (/^['"]/.test(token)) className = 'string'
      else if (token.startsWith('#')) className = 'comment'
      else if (/^--?/.test(token)) className = 'shell-flag'
      else if (/^(?:\.{1,2}\/|~\/|\/)/.test(token)) className = 'path'
      else if (token.startsWith('@')) className = 'package'
      else if (/^\d/.test(token)) className = 'number'
      else if (/^(?:&&|\|\||\||>>?|<<)$/.test(token)) className = 'operator'
      html += `<span class="token-${className}">${escapeHtml(token)}</span>`
    }
    offset = match.index + match[0].length
  }
  html += escapeHtml(source.slice(offset))
  return html
}

function highlightInline(value) {
  const pattern = /(https?:\/\/[A-Za-z0-9./?=&_%#@:+~-]+|(?:\.{1,2}\/|~\/|\/)[^\s'"，。；]+|@[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+(?:@[^\s'"，。；]+)?|\b(?:TypeScript|YAML|HTTP|Web|Profile|Patch|Cordis|Provider|Consumer|Bundle|HMR|npm|pnpm|greet|dsh-running-ant|dsh-web-ui)\b|\b\d+(?:\.\d+)*\b)/gi
  return value.split(pattern).map(token => {
    if (!token) return ''
    let className = 'concept'
    if (token.startsWith('http')) className = 'url'
    else if (/^(?:\.{1,2}\/|~\/|\/)/.test(token)) className = 'path'
    else if (token.startsWith('@')) className = 'package'
    else if (/^\d/.test(token)) className = 'number'
    return `<span class="token-${className}">${escapeHtml(token)}</span>`
  }).join('')
}

function looksLikeShell(line) {
  return /^\s*(?:cd|pnpm|node|exec|curl|lsof|grep|ls|tar|test|sed|printf|npm|head|echo|if\b|then\b|else\b|fi\b|html=)/.test(line)
}

function highlightWorkshopLine(line, nextLine) {
  if (!line) return ''
  if (/^\s*#/.test(line)) return `<span class="token-comment">${escapeHtml(line)}</span>`
  if (nextLine?.includes('→') && line.trim() && !/[：:]\s*$/.test(line)) {
    return `<span class="token-diff-before">${escapeHtml(line)}</span>`
  }
  if (line.includes('→')) {
    const [, indent = '', before = '', arrow = '→', after = ''] = line.match(/^(\s*)(.*?)\s*(→)\s*(.*)$/) ?? []
    return `${escapeHtml(indent)}<span class="token-diff-before">${escapeHtml(before)}</span><span class="token-diff-arrow">${arrow}</span> <span class="token-diff-after">${escapeHtml(after)}</span>`
  }
  if (looksLikeShell(line)) return highlightShell(line)
  if (/^\s*(?:-\s+)?[A-Za-z_][\w.-]*:\s*/.test(line)) return highlightYaml(line)

  const numbered = line.match(/^(\s*)(\d+\.)(\s*)(.*)$/)
  if (numbered) {
    return `${escapeHtml(numbered[1])}<span class="token-list-index">${numbered[2]}</span>${escapeHtml(numbered[3])}${highlightInline(numbered[4])}`
  }

  const bullet = line.match(/^(\s*)(-\s+)(.*)$/)
  if (bullet) {
    return `${escapeHtml(bullet[1])}<span class="token-list-bullet">${escapeHtml(bullet[2])}</span>${highlightInline(bullet[3])}`
  }

  const label = line.match(/^(\s*[^:：\/\n]{1,24}[：:])(\s*)(.*)$/)
  if (label) {
    const className = label[3] ? 'label' : 'section'
    return `<span class="token-${className}">${escapeHtml(label[1])}</span>${escapeHtml(label[2])}${highlightInline(label[3])}`
  }
  return highlightInline(line)
}

function highlightWorkshopContent(source) {
  const lines = source.split('\n')
  return lines.map((line, index) => highlightWorkshopLine(line, lines[index + 1])).join('\n')
}

/** Highlights one Workshop step without changing its source text. */
export function highlightContent(source, step) {
  if (/\.tsx?$/.test(step.file) || step.kind.startsWith('TypeScript')) return highlightTypeScript(source)
  if (step.kind.startsWith('YAML') || step.kind.startsWith('Profile Patch')) return highlightYaml(source)
  return highlightWorkshopContent(source)
}

/** Highlights one streamed terminal line while preserving status colors. */
export function highlightTerminalLine(line) {
  if (!line) return ''
  const prompted = line.match(/^(\$\s+)(.*)$/)
  if (prompted) {
    const body = prompted[2].startsWith('[') ? highlightInline(prompted[2]) : highlightShell(prompted[2])
    return `<span class="terminal-command"><span class="token-terminal-prompt">${escapeHtml(prompted[1])}</span>${body}</span>`
  }
  if (/^退出码：?\s*0\s*$/.test(line)) return `<span class="terminal-success">${escapeHtml(line)}</span>`
  if (/^退出码：?\s*[1-9]\d*\s*$/.test(line) || line.includes('[执行错误]')) {
    return `<span class="terminal-error">${escapeHtml(line)}</span>`
  }
  if (looksLikeShell(line)) return `<span class="terminal-command">${highlightShell(line)}</span>`
  return `<span class="terminal-result">${highlightInline(line)}</span>`
}
