import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API calls to the Fastify BFF so the browser hits one origin.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
