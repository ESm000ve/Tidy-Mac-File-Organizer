# Tidy Storybook build record

Scope: the full Figma companion requested by Eric. Components were implemented incrementally in a dedicated checkout. This is a proposed library with real source comparison stories, not a completed app-wide migration.

## 2026-09-12 Token layer Extraction (Session 1)

### 1. Token layer
- **Path**: `design-system/figma-tokens.json` / `tokens.css` / `tokens.ts`
- **Tokens Consumed**: All 108 variables from Figma; aliases retained in CSS and resolved for typed consumers.
- **Decisions / Refactoring**:
  - Exported the existing Figma snapshot; added deterministic generation and a CI drift check.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 Button Extraction (Session 2)

### 1. Button
- **Path**: `design-system/components/index.tsx` / `stories/Button.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 IconButton Extraction (Session 3)

### 1. IconButton
- **Path**: `design-system/components/index.tsx` / `stories/IconButton.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 Toggle Extraction (Session 4)

### 1. Toggle
- **Path**: `design-system/components/index.tsx` / `stories/Toggle.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 TextField Extraction (Session 5)

### 1. TextField
- **Path**: `design-system/components/index.tsx` / `stories/TextField.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 Select Extraction (Session 6)

### 1. Select
- **Path**: `design-system/components/index.tsx` / `stories/Select.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 ExtensionChip Extraction (Session 7)

### 1. ExtensionChip
- **Path**: `design-system/components/index.tsx` / `stories/ExtensionChip.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 StatusBadge Extraction (Session 8)

### 1. StatusBadge
- **Path**: `design-system/components/index.tsx` / `stories/StatusBadge.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 FolderCard Extraction (Session 9)

### 1. FolderCard
- **Path**: `design-system/components/index.tsx` / `stories/FolderCard.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 RuleCard Extraction (Session 10)

### 1. RuleCard
- **Path**: `design-system/components/index.tsx` / `stories/RuleCard.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 AiCommand Extraction (Session 11)

### 1. AiCommand
- **Path**: `design-system/components/index.tsx` / `stories/AiCommand.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 PreviewRow Extraction (Session 12)

### 1. PreviewRow
- **Path**: `design-system/components/index.tsx` / `stories/PreviewRow.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 Feedback Extraction (Session 13)

### 1. Feedback
- **Path**: `design-system/components/index.tsx` / `stories/Feedback.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 RunStatus Extraction (Session 14)

### 1. RunStatus
- **Path**: `design-system/components/index.tsx` / `stories/RunStatus.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 Schedule Extraction (Session 15)

### 1. Schedule
- **Path**: `design-system/components/index.tsx` / `stories/Schedule.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## 2026-09-12 Dialog Extraction (Session 16)

### 1. Dialog
- **Path**: `design-system/components/index.tsx` / `stories/Dialog.stories.tsx`
- **Tokens Consumed**: Shared component CSS consumes semantic color, spacing, size, radius, stroke and motion tokens. Exact references are indexed in `TOKEN-USAGE.md`.
- **Decisions / Refactoring**:
  - Implemented the proposed API and all Figma variant combinations. Stories document purpose, keyboard behavior, semantics and adoption boundaries.
  - Existing Electron application consumers are unchanged. Native behavior and VoiceOver validation remain open adoption gates.

## Validation and review

- Storybook static production build passed.
- App type check and Storybook type check passed.
- Chromium suite: 178 stories passed across 21 files, including five focused play-function checks.
- Accessibility checks found and drove fixes for primary hover contrast, disabled-field helper contrast, heading hierarchy and duplicate landmark semantics.
- Primary hover token changed to #004A99 in Figma and the exported snapshot.
- Visual review covered the overview, dark workflow, button matrix, destructive dialog and narrow overview.
- Existing app-source accessibility findings remain TODO and are not suppressed globally. Manual VoiceOver and native Electron validation remain outstanding.
- New Vitest dependencies were patched to 3.2.7; existing dependency advisories remain outside this Storybook-focused change.
