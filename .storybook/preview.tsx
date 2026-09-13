import React, { useEffect } from 'react';
import type { Preview } from '@storybook/react-vite';
import { MotionConfig } from 'motion/react';
import '../src/styles/index.css';
import '../design-system/tokens.css';
import '../design-system/system.css';
function Theme({ children, theme, motion }: { children: React.ReactNode; theme: string; motion: string }) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.motion = motion;
    return () => { document.documentElement.classList.remove('dark'); delete document.documentElement.dataset.motion; };
  }, [theme, motion]);
  return <MotionConfig reducedMotion={motion === 'reduced' ? 'always' : 'user'}><div className="tidy-stage">{children}</div></MotionConfig>;
}
const preview: Preview = {
  globalTypes: {
    theme: { description: 'Appearance', toolbar: { icon: 'circlehollow', items: ['light', 'dark'], dynamicTitle: true } },
    motion: { description: 'Motion preference', toolbar: { icon: 'play', items: ['standard', 'reduced'], dynamicTitle: true } },
  },
  initialGlobals: { theme: 'light', motion: 'standard' },
  decorators: [(Story, context) => <Theme theme={context.globals.theme} motion={context.globals.motion}><Story /></Theme>],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'error' },
    options: { storySort: { order: ['Start here', 'Foundations', 'Components', 'Workflows', 'In the app', 'Practice'] } },
  },
};
export default preview;
