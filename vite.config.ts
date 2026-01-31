
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      base: './', // Ensures assets load correctly when hosted in subdirectories or iframes
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Explicitly define environment variables for the client
        'process.env.VITE_WP_URL': JSON.stringify(env.VITE_WP_URL || ''),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: `assets/[name].js`,
            chunkFileNames: `assets/[name].js`,
            assetFileNames: `assets/[name].[ext]`
          }
        }
      }
    };
});
