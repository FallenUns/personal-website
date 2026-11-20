import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { content } from './scripts/content/plugin'
import { devRender } from './scripts/dev-render-plugin'

export default defineConfig({
  plugins: [react(), content(), devRender()],
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
  build: {
    target: 'es2022',
    manifest: true,
    minify: 'terser',
    terserOptions: {
      compress: { pure_funcs: ['console.log', 'console.debug'], drop_debugger: true },
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
})
