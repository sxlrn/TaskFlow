import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('882588794900-9ev9i6bcetou2fgqa4p5rkrr3ihc79vu.apps.googleusercontent.com'),
  },
})