import { Service, type Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'

declare module '@deepseek-ai/cordis' {
  interface Context {
    mockProvider: MockProviderService
  }
}

export interface Config {
  apiKey: string
  baseURL: string
}

export const Config: Schema<Config> = Schema.object({
  apiKey: Schema.string().required(),
  baseURL: Schema.string().required(),
})

function maskApiKey(apiKey: string): string {
  if (apiKey.length < 9) return '***'
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
}

export class MockProviderService extends Service {
  constructor(ctx: Context, public readonly config: Config) {
    super(ctx, 'mockProvider')
    console.log(`[mock-provider] loaded baseURL=${config.baseURL} apiKey=${maskApiKey(config.apiKey)}`)
    ctx.effect(() => () => {
      console.log(`[mock-provider] disposed baseURL=${config.baseURL}`)
    })
  }
}

export const name = 'mock-provider'

export function apply(ctx: Context, config: Config): void {
  ctx.plugin(MockProviderService, config)
}
