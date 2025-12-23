import { build, type Options } from 'tsup'
import { writeFile } from 'fs/promises'
import { generateDtsBundle } from 'dts-bundle-generator'
import { dirname, join } from 'path'
import { mkdir } from 'fs/promises'

const sharedConfig: Options = {
  platform: 'node',
  entry: ['src/loggings.ts'],
  bundle: true,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  skipNodeModulesBundle: true,
  clean: true,
  dts: false
}

await build({
  format: 'cjs',
  outDir: 'cjs',
  tsconfig: './tsconfig.cjs.json',
  splitting: false,
  shims: true,
  ...sharedConfig
})

await build({
  format: 'esm',
  outDir: 'mjs',
  tsconfig: './tsconfig.mjs.json',
  splitting: true,
  cjsInterop: false,
  ...sharedConfig
})

await build({
  format: 'esm',
  outDir: 'cdn',
  tsconfig: './tsconfig.mjs.json',
  splitting: true,
  cjsInterop: false,
  ...sharedConfig,
  target:["es2024"],
  entry:['src/cdn.ts'],
  noExternal: ['node:util'],
  esbuildPlugins: [
    {
      name: 'replace-node-module',
      setup(build) {
        build.onResolve({ filter: /^node:util$/ }, () => {
          return { path: 'node:util', namespace: 'replace-node-module' }
        })
        build.onLoad({ filter: /.*/, namespace: 'replace-node-module' }, () => {
          return {
            contents: 'export const inspect = (msg) => msg',
            loader: 'js'
          }
        })
      }
    }
  ]
})

await writeFile('cjs/package.json', JSON.stringify({ type: 'commonjs' }, null, 2))
await writeFile('mjs/package.json', JSON.stringify({ type: 'module' }, null, 2))

const dtsPath = join(process.cwd(), 'loggings.d.ts')
let dtsCode = generateDtsBundle([{
  filePath: join(process.cwd(), 'src/index.ts'),
  output: {
    sortNodes: true,
    exportReferencedTypes: true,
    inlineDeclareExternals: true,
    inlineDeclareGlobals: true
  }
}]).join("\n")

await mkdir(dirname(dtsPath), { recursive: true });
dtsCode = `import { Console } from "console"\n` + dtsCode
await writeFile(dtsPath, dtsCode, { encoding: 'utf-8' })
