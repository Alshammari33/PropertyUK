import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/properties': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/recommend': 'http://localhost:8000',
    },
  },
});
