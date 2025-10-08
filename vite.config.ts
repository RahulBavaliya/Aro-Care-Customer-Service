import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
   base: process.env.VERCEL ? '/' : 'Aro-Care-Customer-Service',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
