import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwind from '@tailwindcss/vite';
export default defineConfig({
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react/jsx-dev-runtime', 'react/jsx-runtime', 'react', 'react-dom/client'] },
  plugins: [tailwind(), storybookTest({ configDir: '.storybook' })],
  test: { fileParallelism: false, maxWorkers: 1, name: 'storybook', browser: { enabled: true, headless: true, provider: 'playwright', instances: [{ browser: 'chromium' }] } },
});
