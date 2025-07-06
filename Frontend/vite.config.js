import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',  // your backend URL
        changeOrigin: true,
        secure: false,
      },
      "/dailyco": {
        target: "https://stern.daily.co",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
