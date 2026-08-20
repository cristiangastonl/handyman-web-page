import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  test: {
    // Los .spec de Playwright viven en e2e/ y los corre `npm run e2e`,
    // no Vitest: importarlos desde acá revienta con "test.describe() here".
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  }
})
