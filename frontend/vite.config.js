import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The shared Firebase key lives in the repository-root .env file.
  envDir: '..',
  resolve: {
    // Firebase Auth and App must share one component registry at runtime.
    dedupe: ['@firebase/app'],
  },
})
