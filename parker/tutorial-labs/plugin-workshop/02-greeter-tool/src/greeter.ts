import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context {
    parkerGreeter: ParkerGreeterService
  }
}

export class ParkerGreeterService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'parkerGreeter')
  }

  greet(who: string): string {
    return `你好，${who}！这是 parkerGreeter 服务。`
  }
}

export function apply(ctx: Context): void {
  ctx.plugin(ParkerGreeterService)
}
