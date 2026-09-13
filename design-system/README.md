# Tidy design system

The executable companion to [the Figma system](https://www.figma.com/design/F4cJIG7cCiURqp30nqszk9).

## Use locally

- `npm ci`
- `npm run storybook`
- `npm run typecheck:storybook`
- `npm run build-storybook`
- `npx playwright install chromium`
- `npm run test-storybook`

The static output is `storybook-static/`. GitHub Actions builds and tests pull requests, then deploys the main branch to GitHub Pages.

## What is included

108 Figma variables; CSS and typed token exports; 15 proposed component families with 120 named variant stories; state matrices; Light/Dark and reduced-motion controls; interactive workflows; real app-source comparison stories; principles, content, accessibility, governance, adoption and interview documentation.

## Implementation boundary

`components/` contains proposed Figma-aligned APIs. They are used by this Storybook, not yet by the Electron app. `CurrentApp.stories.tsx` directly imports existing production-source components. Demonstrations use local state and never access the filesystem, persist schedules or call AI services.

The native select's expanded specimen approximates the open choice list, not a native macOS popup. Drag appearance is a static specimen. The proposed bordered medium switch uses an 18px thumb rather than Figma's 20px thumb. Fonts resolve through the operating-system stack.

## Token workflow

`figma-tokens.json` is a timestamped-by-git snapshot of the Figma file. Run `npm run tokens:build` after replacing it with a reviewed export. CSS keeps semantic aliases; TypeScript exports resolved values. Do not edit generated files manually. The CI diff check catches drift.

Figma aliases map to `--tidy-*`: `bg/surface` → `--tidy-bg-surface`, `space/16` → `--tidy-space-16`. Light/Dark are selected by the document's `.dark` class; motion can be forced with `data-motion="reduced"` and also honors the OS preference.

Documentation-only typography and layout variables are declared in `system.css`. No existing app tokens or consumers were migrated by this change.

## Validation boundary

Interaction assertions cover toggle keyboard behavior, chip selection, modal focus/escape, AI scope copy and the complete manual-run journey. Axe runs through the Storybook accessibility addon. Existing app-source specimens have accessibility checks marked TODO because they preserve existing issues for review.

Manual VoiceOver, native Electron operations, complete visual parity, browser diversity and low-vision testing remain required before declaring the proposed components stable.
