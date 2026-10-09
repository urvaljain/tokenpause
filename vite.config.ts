import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static-site build: relative asset paths so the output can be hosted from any
// path on Vercel, Netlify, GitHub Pages or a plain file server.
export default defineConfig({
  base: './',
  plugins: [react()],
});
