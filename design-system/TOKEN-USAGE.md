# Token references

The source of truth is `figma-tokens.json`. Component styling is centralized in `system.css`; selectors map directly to the 15 exported component names. Documentation-only layout and type additions are declared at the top of that file.

- `--tidy-accent-blue`
- `--tidy-accent-green`
- `--tidy-action-destructive`
- `--tidy-action-hover`
- `--tidy-action-primary`
- `--tidy-bg-hover`
- `--tidy-bg-inset`
- `--tidy-bg-surface`
- `--tidy-bg-window`
- `--tidy-border-default`
- `--tidy-border-subtle`
- `--tidy-dialog-width`
- `--tidy-duration-control`
- `--tidy-duration-feedback`
- `--tidy-focus-ring`
- `--tidy-font`
- `--tidy-line-body`
- `--tidy-line-title`
- `--tidy-measure`
- `--tidy-radius-12`
- `--tidy-radius-16`
- `--tidy-radius-24`
- `--tidy-radius-6`
- `--tidy-radius-8`
- `--tidy-radius-999`
- `--tidy-size-14`
- `--tidy-size-16`
- `--tidy-size-18`
- `--tidy-size-24`
- `--tidy-size-32`
- `--tidy-size-36`
- `--tidy-size-40`
- `--tidy-size-42`
- `--tidy-size-44`
- `--tidy-size-56`
- `--tidy-space-0`
- `--tidy-space-12`
- `--tidy-space-16`
- `--tidy-space-2`
- `--tidy-space-20`
- `--tidy-space-24`
- `--tidy-space-32`
- `--tidy-space-4`
- `--tidy-space-40`
- `--tidy-space-48`
- `--tidy-space-6`
- `--tidy-space-64`
- `--tidy-space-8`
- `--tidy-space-80`
- `--tidy-stroke-1`
- `--tidy-stroke-2`
- `--tidy-stroke-3`
- `--tidy-text-ai`
- `--tidy-text-error`
- `--tidy-text-link`
- `--tidy-text-on-accent`
- `--tidy-text-primary`
- `--tidy-text-secondary`
- `--tidy-text-success`
- `--tidy-text-warning`
- `--tidy-toggle-off`
- `--tidy-toggle-thumb`
- `--tidy-type-body`
- `--tidy-type-caption`
- `--tidy-type-display`
- `--tidy-type-lead`
- `--tidy-type-title`

## Source mapping

App values were not globally replaced. Existing `--system-blue` remains the native accent; proposed `--tidy-action-primary` uses the Figma ink color for white-label contrast. Semantic text tokens deliberately differ from translucent native label colors. See Storybook Practice → Source Mapping for every component consumer.
