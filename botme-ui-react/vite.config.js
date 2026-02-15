import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_BASE_URL || env.VITE_API_URL || 'http://127.0.0.1:5000'
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          // When deploying behind HTTPS or a reverse proxy adjust rewrite/headers here.
        },
      },
    },
  }
})

