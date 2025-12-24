import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const define: Record<string, string> = {};
  
  for (const key in env) {
    define[`process.env.${key}`] = JSON.stringify(env[key]);
  }

  return {
    plugins: [react()],
    define: define,
    build: {
      outDir: 'dist',
    }
  };
});