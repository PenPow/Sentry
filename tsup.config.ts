import { defineConfig } from 'tsup';
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';

export default defineConfig({
  entry: ['src/index.ts'],
  target: ['node18', 'es2022'],
  minify: false,
  keepNames: true,
  outDir: 'dist',
  format: ['esm'],
  skipNodeModulesBundle: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: false,
  bundle: false,
  platform: 'node',
  shims: false,
  esbuildPlugins: [esbuildPluginVersionInjector({ versionOrCurrentDate: 'current-date' })]
})
