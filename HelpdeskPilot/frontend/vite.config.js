import { defineConfig } from 'vite';
     import react from '@vitejs/plugin-react';

     export default defineConfig({
       root: 'C:/Users/K.Devisrinivas/Desktop/HelpdeskPilot/frontend', // Explicit root path
       publicDir: false, // Disable default public directory
       build: {
         outDir: 'dist', // Output directory for build
       },
       plugins: [react()],
       server: {
         port: 5173,
         open: true,
       },
     });