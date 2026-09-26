import { defineConfig } from 'tsdown'

/** Bootstrap the adapter before Typert loads its runtime exports. */
export default defineConfig({
  cwd: import.meta.dirname,
  entry: ['lib/types/index.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  clean: false,
  dts: false,
})
