import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
addons.setConfig({
  theme: create({ base: 'light', brandTitle: 'Tidy / Design System', brandUrl: '?path=/story/start-here--overview', colorPrimary: '#0055bb', colorSecondary: '#0055bb', fontBase: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }),
  sidebar: { showRoots: true },
});
