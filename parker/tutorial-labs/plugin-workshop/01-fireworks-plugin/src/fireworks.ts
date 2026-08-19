import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'

export const inject = ['webServer']

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.webServer.tapIndex(html => html.replace('</body>', '<div title="fireworks plugin loaded" style="position:fixed;right:24px;top:24px;z-index:9999;font-size:48px;pointer-events:none">🎆</div></body>')))
}
