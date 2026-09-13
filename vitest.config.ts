import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
export default defineConfig({
  resolve: { dedupe: ['react', 'react-dom'] },
  plugins: [storybookTest({ configDir: '.storybook' })],
  test: { fileParallelism: false, maxWorkers: 1, name: 'storybook', browser: { enabled: true, headless: true, provider: 'playwright', instances: [{ browser: 'chromium' }] } },
});
