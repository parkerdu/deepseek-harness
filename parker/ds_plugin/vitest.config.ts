import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    include: ['plugins/*/tests/**/*.spec.{ts,tsx}'],
    pool: 'forks',
  },
})
