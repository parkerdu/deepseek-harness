/**
 * Minimal standalone build preset for DSH browser plugins.
 *
 * DSH does not load a browser plugin as a normal ESM file. The emitted client
 * bundle registers a closure factory with `window.__ModuleLoader__`; shared
 * React/Cordis identities are then resolved from DSH's module table. CSS
 * Modules are compiled and injected as plugin-owned style tags.
 */
import { readFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import type { UserConfig } from 'tsdown'
import { transform } from 'lightningcss'
import { PLATFORM_MODULES } from './web-platform.ts'

const CSS_PREFIX = '\0dsh-plugin-css:'
const CSS_SUFFIX = '.mjs'

function cssModules(id: string) {
  return {
    name: 'dsh-plugin-css-modules',
    resolveId(source: string, importer?: string) {
      if (!source.endsWith('.module.css') || importer === undefined) return null
      return CSS_PREFIX + resolve(dirname(importer), source) + CSS_SUFFIX
    },
    async load(virtualId: string) {
      if (!virtualId.startsWith(CSS_PREFIX)) return null
      const filename = virtualId.slice(CSS_PREFIX.length, -CSS_SUFFIX.length)
      this.addWatchFile(filename)
      const source = await readFile(filename)
      const result = transform({
        filename,
        code: source,
        cssModules: { pattern: '[hash]_[local]' },
        minify: true,
      })
      const classes: Record<string, string> = {}
      for (const [local, value] of Object.entries(result.exports ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
        classes[local] = value.name
      }
      const tagId = `${id}/${basename(filename)}`
      return [
        `const css = ${JSON.stringify(result.code.toString())};`,
        `const tagId = ${JSON.stringify(tagId)};`,
        "if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {",
        "  const tag = document.createElement('style');",
        `  tag.dataset.plugin = ${JSON.stringify(id)};`,
        '  tag.dataset.pluginCss = tagId;',
        '  tag.textContent = css;',
        '  document.head.appendChild(tag);',
        '}',
        `export default ${JSON.stringify(classes)};`,
      ].join('\n')
    },
  }
}

/** Create the Host and browser build faces for one standalone UI plugin. */
export function dshClientBundle(id: string): UserConfig[] {
  return [
    {
      name: id,
      entry: ['src/index.ts'],
      outDir: 'lib',
      format: ['esm'],
      platform: 'node',
      target: 'es2024',
      fixedExtension: false,
      dts: false,
      clean: false,
      external: ['@deepseek-ai/cordis'],
    },
    {
      name: `${id}/client`,
      entry: { client: 'src/client/index.ts' },
      outDir: 'lib',
      format: 'cjs',
      platform: 'browser',
      target: 'es2022',
      dts: false,
      sourcemap: true,
      clean: false,
      external: [...PLATFORM_MODULES],
      noExternal: (moduleId: string) => PLATFORM_MODULES.includes(moduleId as never) ? undefined : true,
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
        'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
        'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
      },
      plugins: [cssModules(id)],
      outputOptions: {
        entryFileNames: 'client.js',
        banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
        footer: 'return module.exports; } });',
        intro: 'var module = { exports: {} }; var exports = module.exports;',
      },
    },
  ]
}
