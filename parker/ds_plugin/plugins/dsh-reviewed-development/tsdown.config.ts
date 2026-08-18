import { dshClientBundle } from '../../shared/tsdown.client.ts'

const configs = dshClientBundle('dsh-reviewed-development')
const host = configs[0]
if (host !== undefined) {
  host.external = [
    '@deepseek-ai/cordis',
    '@deepseek-ai/dsh-tools',
    '@deepseek-ai/schemastery',
  ]
}
export default configs
