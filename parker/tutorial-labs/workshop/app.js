import { createChapters } from './chapters/index.js'
import { highlightContent, highlightTerminalLine } from './chapters/syntax-highlight.mjs'

const executor = globalThis.__WORKSHOP_EXECUTOR__
const runtime = { repositoryRoot: executor?.repositoryRoot ?? '/absolute/path/to/deepseek-harness' }
const chapters = createChapters(runtime)
const executions = new Map()
let chapterIndex = 0
let experimentIndex = 0
let stepIndex = 0

const elements = Object.fromEntries([
  'chapterTabs', 'executorState', 'chapterEyebrow', 'chapterTitle',
  'chapterProgressText', 'chapterProgress', 'chapterProgressBar', 'experimentCount', 'experimentList',
  'stepCount', 'stepList', 'experimentNumber', 'stepKind',
  'stepTitle', 'stepDescription', 'stepFile', 'stepContent', 'copyButton',
  'terminalAction', 'terminalStatus', 'terminalOutput', 'clearButton', 'stepExpected',
  'runButton', 'stopButton', 'openButton', 'previousButton', 'nextButton', 'copyStatus',
].map(id => [id, document.getElementById(id)]))

function currentChapter() {
  return chapters[chapterIndex]
}

function currentExperiment() {
  return currentChapter().experiments[experimentIndex]
}

function currentStep() {
  return currentExperiment().steps[stepIndex]
}

function executionFor(step = currentStep()) {
  return executions.get(step.id)
}

function renderCode(source, step) {
  elements.stepContent.innerHTML = highlightContent(source, step)
}

function renderTerminal(output) {
  const empty = !output
  elements.terminalOutput.classList.toggle('empty', empty)
  if (empty) {
    elements.terminalOutput.textContent = '尚未执行\n点击“真实执行此步骤”，命令输出会实时显示在这里。\n'
    return
  }
  elements.terminalOutput.innerHTML = output.split('\n').map(highlightTerminalLine).join('\n')
}

function renderChapterTabs() {
  elements.chapterTabs.replaceChildren(...chapters.map((chapter, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = index === chapterIndex ? 'active' : ''
    if (index === chapterIndex) button.setAttribute('aria-current', 'page')
    button.textContent = chapter.tab
    button.addEventListener('click', () => {
      chapterIndex = index
      experimentIndex = 0
      stepIndex = 0
      render()
    })
    return button
  }))
}

function renderChapter() {
  const chapter = currentChapter()
  elements.chapterEyebrow.textContent = chapter.eyebrow
  elements.chapterTitle.textContent = chapter.title
  elements.experimentCount.textContent = `${chapter.experiments.length} 个实验`
}

function renderExperiments() {
  elements.experimentList.replaceChildren(...currentChapter().experiments.map((experiment, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `experiment-button${index === experimentIndex ? ' active' : ''}`
    button.setAttribute('aria-pressed', String(index === experimentIndex))
    const running = experiment.steps.some(step => executionFor(step)?.status === 'running')
    const completed = experiment.steps.filter(step => executionFor(step)?.status === 'success').length
    button.innerHTML = `<span class="experiment-copy"><strong></strong></span><span class="experiment-level">${experiment.level}</span><i aria-hidden="true" class="experiment-state ${running ? 'running' : completed === experiment.steps.length ? 'success' : ''}"></i>`
    button.querySelector('strong').textContent = experiment.title
    button.addEventListener('click', () => {
      experimentIndex = index
      stepIndex = 0
      renderExperiments()
      renderSteps()
      renderStep()
    })
    return button
  }))
}

function renderSteps() {
  const experiment = currentExperiment()
  elements.stepCount.textContent = `${stepIndex + 1} / ${experiment.steps.length}`
  elements.stepList.replaceChildren(...experiment.steps.map((step, index) => {
    const execution = executionFor(step)
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `step-button${index === stepIndex ? ' active' : ''}`
    if (index === stepIndex) button.setAttribute('aria-current', 'step')
    button.innerHTML = `<span class="step-index">STEP ${String(index + 1).padStart(2, '0')}</span><span><strong></strong></span><i aria-hidden="true" class="step-state ${execution?.status ?? 'idle'}"></i>`
    button.querySelector('strong').textContent = step.title
    button.addEventListener('click', () => {
      stepIndex = index
      renderSteps()
      renderStep()
    })
    return button
  }))
}

function renderStep() {
  const experiment = currentExperiment()
  const step = currentStep()
  const execution = executionFor(step)
  elements.stepCount.textContent = `${stepIndex + 1} / ${experiment.steps.length}`
  elements.experimentNumber.textContent = `实验 ${experiment.number}`
  elements.stepKind.textContent = step.kind
  elements.stepTitle.textContent = step.title
  elements.stepDescription.textContent = step.description
  elements.stepFile.textContent = step.file
  renderCode(step.content, step)
  elements.stepExpected.textContent = step.expected
  elements.terminalAction.textContent = step.id
  renderTerminal(execution?.output || '')
  elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight
  setStatus(execution?.status ?? 'idle')
  elements.runButton.disabled = !executor || execution?.status === 'running'
  elements.runButton.innerHTML = executor ? '<span aria-hidden="true">▶</span>真实执行此步骤' : '<span aria-hidden="true">×</span>请从本地执行器打开'
  elements.stopButton.disabled = execution?.status !== 'running'
  elements.clearButton.disabled = execution?.status === 'running' || !execution?.output
  elements.previousButton.disabled = stepIndex === 0
  elements.nextButton.disabled = stepIndex === experiment.steps.length - 1
  elements.openButton.hidden = !step.url
  if (step.url) elements.openButton.href = step.url
  renderProgress()
}

function setStatus(status) {
  const labels = {
    idle: '等待执行',
    running: '流式执行中',
    success: '执行完成',
    failed: '执行失败',
    cancelled: '已停止',
  }
  elements.terminalStatus.className = `status-badge ${status}`
  elements.terminalStatus.textContent = labels[status]
}

function renderProgress() {
  const steps = currentChapter().experiments.flatMap(experiment => experiment.steps)
  const completed = steps.filter(step => executionFor(step)?.status === 'success').length
  elements.chapterProgressText.textContent = `${completed} / ${steps.length}`
  elements.chapterProgressBar.style.width = `${steps.length === 0 ? 0 : completed / steps.length * 100}%`
  elements.chapterProgress.setAttribute('aria-valuemax', String(steps.length))
  elements.chapterProgress.setAttribute('aria-valuenow', String(completed))
  elements.chapterProgress.setAttribute('aria-valuetext', `已完成 ${completed} 个步骤，共 ${steps.length} 个步骤`)
}

function render() {
  renderChapterTabs()
  renderChapter()
  renderExperiments()
  renderSteps()
  renderStep()
}

async function runCurrentStep() {
  if (!executor) return
  const step = currentStep()
  if (executionFor(step)?.status === 'running') return
  const controller = new AbortController()
  const execution = { status: 'running', output: '', controller }
  executions.set(step.id, execution)
  renderExperiments()
  renderSteps()
  renderStep()
  try {
    const response = await fetch(`${executor.origin}/api/actions/${encodeURIComponent(step.id)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-workshop-token': executor.token,
      },
      body: JSON.stringify({ content: step.content }),
      signal: controller.signal,
    })
    if (!response.ok) {
      const failure = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      throw new Error(failure.error || `HTTP ${response.status}`)
    }
    if (!response.body) throw new Error('浏览器没有返回可读的流式响应')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      execution.output += decoder.decode(value, { stream: true })
      if (currentStep().id === step.id) {
        renderTerminal(execution.output)
        elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight
      }
    }
    execution.output += decoder.decode()
    execution.status = 'success'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      execution.status = 'cancelled'
      execution.output += '\n[Workshop 已停止当前命令]\n'
    } else {
      execution.status = 'failed'
      execution.output += `\n[执行错误] ${error instanceof Error ? error.message : String(error)}\n`
    }
  } finally {
    delete execution.controller
    renderExperiments()
    renderSteps()
    renderStep()
  }
}

elements.runButton.addEventListener('click', runCurrentStep)
elements.stopButton.addEventListener('click', () => executionFor()?.controller?.abort())
elements.clearButton.addEventListener('click', () => {
  const execution = executionFor()
  if (!execution || execution.status === 'running') return
  executions.delete(currentStep().id)
  renderExperiments()
  renderSteps()
  renderStep()
})
elements.copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentStep().content)
    elements.copyButton.textContent = '已复制'
    elements.copyStatus.textContent = '内容已复制到剪贴板'
  } catch {
    elements.copyButton.textContent = '复制失败'
    elements.copyStatus.textContent = '复制失败，请手动选择内容复制'
  }
  setTimeout(() => {
    elements.copyButton.textContent = '复制'
    elements.copyStatus.textContent = ''
  }, 1200)
})
elements.previousButton.addEventListener('click', () => {
  if (stepIndex === 0) return
  stepIndex -= 1
  renderSteps()
  renderStep()
})
elements.nextButton.addEventListener('click', () => {
  if (stepIndex === currentExperiment().steps.length - 1) return
  stepIndex += 1
  renderSteps()
  renderStep()
})

if (!executor) {
  elements.executorState.textContent = 'STATIC PREVIEW'
  document.querySelector('.runtime-pill').classList.add('offline')
}
render()
