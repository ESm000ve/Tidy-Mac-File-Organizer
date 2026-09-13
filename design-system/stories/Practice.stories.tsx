import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Table, figma } from './shared';
const meta = { title: 'Practice', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj;
export const Accessibility: Story = { render: () => <Page eyebrow="Practice / Accessibility" title="Build access into the contract" intro="Automated checks identify some failures. They do not replace keyboard, screen-reader, low-vision or native macOS validation."><Table headings={['Area','Contract','Review method']} rows={[
['Keyboard','Every action has a keyboard path; focus stays visible and returns from a modal.','Tab through controls; Space/Enter activation; Escape and focus restoration.'],
['Names and states','Visible labels are linked; selected, expanded, busy and invalid states are exposed.','Inspect the accessibility tree and verify announcements with VoiceOver.'],
['Color','Normal text targets 4.5:1; large text and essential graphics have separate criteria.','Axe addon and manual inspection of both themes, including hover/focus.'],
['Targets','Compact macOS geometry requires a target-size and spacing review.','Check WCAG 2.2 minimum-target exceptions and consider expanded density.'],
['Motion','Reduced motion preserves status and progress meaning.','Toolbar override plus operating-system preference.'],
['Zoom and reflow','Documentation and responsive examples remain readable at narrow widths.','200% zoom, 320 CSS-pixel width, long filenames and translations.'],
['Announcements','Errors are timely; routine updates do not repeatedly interrupt.','VoiceOver with real asynchronous operation timing.'],
]} /><div className="tidy-callout"><strong>Current status</strong><p>The proposed library includes named native controls, linked help text, semantic states and reduced motion. Storybook’s accessibility panel is available on every story. Existing app examples retain source behavior and carry their own known limitations. Passing automated tests is not a WCAG conformance claim.</p></div><div className="tidy-wrap"><a href="https://www.w3.org/TR/WCAG22/">WCAG 2.2</a><a href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html">Target-size guidance</a></div></Page> };
export const SourceMapping: Story = { render: () => <Page eyebrow="Practice / Handoff" title="Know what exists, and what is proposed" intro="This library is a reviewable adoption target. Existing app components are imported directly in the In the app section; the proposed library is not yet wired into the Electron application."><Table headings={['System family','Existing source','Adoption work']} rows={[
['Button / Icon button','TopBar, NoticeDialog, FolderCard','Consolidate inline actions after behavior and visual parity review.'],
['Toggle','controls/MacToggle.tsx','Compare native switch semantics, target size and thumb geometry.'],
['Text field / Folder card','FolderCard.tsx','Preserve Electron folder selection and path validation.'],
['Select','controls/MacSelect.tsx','Choose native vs Radix popup after keyboard and platform review.'],
['Rule card / Extension chip','sections/CategoryRuleCard.tsx','Retain all offered extensions and filtering behavior.'],
['AI command','sections/AiCommandBar.tsx','Adopt Rules updated copy; preserve request cancellation/error behavior.'],
['Preview row','PreviewSheet.tsx','Preserve confidence, rename acceptance and actual operation data.'],
['Status badge / Feedback / Run status','StatusBar.tsx, PreviewSheet.tsx','Unify vocabulary without collapsing partial failure into success.'],
['Schedule','BottomPanel.tsx, electron/ipc/schedule.ts','Align UI with Monday/day-one scheduling and app-process lifetime.'],
['Dialog','NoticeDialog.tsx','Preserve modal semantics and safe focus restoration.'],
]} /><p><a href={figma}>Figma specification ↗</a> · <a href="https://github.com/ESm000ve/Tidy-Mac-File-Organizer/tree/main/src/app/components">Production source ↗</a></p><p className="tidy-muted">Token names and values are exported from Figma. Component implementation is authored separately and requires parity review; there is no live Code Connect integration.</p></Page> };
export const Governance: Story = { render: () => <Page eyebrow="Practice / Governance" title="A system needs a maintenance model" intro="The unit of progress is a proven, adopted pattern—not another component in the sidebar."><div className="tidy-grid">{[
['Proposed','A documented need, design reference, intended behavior and source mapping. This is the current status of the Figma-aligned library.'],
['In review','Named variants, interaction tests, Light/Dark review and an accessibility review with open issues recorded.'],
['Ready for adoption','App integration is reviewed, regressions checked and native behavior verified.'],
['Stable','A real consumer uses the component. API ownership, change policy and migration notes exist.'],
].map(([title,body])=><article className="tidy-card tidy-stack" key={title}><h2>{title}</h2><p>{body}</p></article>)}</div><Table headings={['Change','Version policy','Required evidence']} rows={[
['Visual or behavioral bug fix','Patch','Regression example and affected-state validation.'],
['Additive variant or optional prop','Minor','Use case, a11y notes, stories and adoption guidance.'],
['Removed prop or changed meaning','Major','Consumer inventory, migration path and deprecation window.'],
['Token value change','Evaluate impact before versioning','Both themes, affected components and contrast checks.'],
]} /><div className="tidy-callout"><strong>Contribution workflow</strong><p>Describe the problem → inspect existing patterns → propose the smallest API → add named states → run checks → review Figma and code together → adopt in the app → document the release. Eric is the product/design owner; additional maintainers are a future team decision.</p></div></Page> };
export const ContentAndTrust: Story = { render: () => <Page eyebrow="Practice / Content" title="Say exactly what changed" intro="File operations carry consequences. Copy should explain scope, preserve agency and avoid promises the application cannot keep."><Table headings={['Situation','Preferred copy','Reason']} rows={[
['AI success','Rules updated. No files have moved.','Separates rule generation from filesystem execution.'],
['Manual preview','Review before you organize.','Gives the user a clear inspection step.'],
['Partial failure','1 moved · 1 failed. Review destination.','Reports mixed outcomes instead of generic failure.'],
['Missing location','Choose a source and destination.','Names the correction without blaming the user.'],
['Scheduled run','Scheduled runs skip preview. Keep Tidy open.','Exposes the actual automation contract.'],
['Overwrite','Existing contents may be replaced. Undo cannot restore overwritten bytes.','Explains the irreversible part of the action.'],
['Empty result','No matching files. Adjust file types or choose another source.','Gives a concrete recovery path.'],
]} /><p className="tidy-muted">Avoid “safe,” “guaranteed,” and “all done” unless the implementation can substantiate the exact claim. The current app’s AI success wording remains visible in the source comparison.</p></Page> };
export const InterviewWalkthrough: Story = { render: () => <Page eyebrow="Practice / Portfolio" title="Tell the story through decisions" intro="A suggested 10-minute walkthrough of your product and the system that makes its behavior coherent. Adapt this outline to your own experience; it does not invent research or results."><Table headings={['Time','Show','Explain']} rows={[
['0–1 min','Product overview','I designed and built Tidy, a macOS file organizer. The central challenge is making automation understandable before it changes someone’s files.'],
['1–3 min','Manual organization workflow','Source, destination, rules and preview form one decision sequence. Show the contrast with scheduled runs.'],
['3–5 min','Foundations + Button matrix','Explain semantic tokens, Light/Dark aliases and why component APIs separate intent from state.'],
['5–7 min','AI command + partial failure','Show precise success copy, manual fallback, partial-result accounting and honest undo limitations.'],
['7–9 min','In the app + source map','Discuss what was extracted, what is proposed and what still needs adoption. Show a real implementation tradeoff.'],
['9–10 min','Governance + next validation','Explain the release gate and how you would measure adoption, accessibility defects and consistency after rollout.'],
]} /><div className="tidy-grid"><article className="tidy-card tidy-stack"><h2>Tradeoff: native fidelity</h2><p>Compact macOS controls preserve familiarity. Expanded targets and stronger text colors may improve access. Evaluate the whole task, not a single isolated swatch.</p></article><article className="tidy-card tidy-stack"><h2>Tradeoff: automation and agency</h2><p>Manual runs make review explicit. Scheduling removes that step, so consequence and lifetime information must move into configuration.</p></article><article className="tidy-card tidy-stack"><h2>Tradeoff: scope and adoption</h2><p>A full proposed library makes the target concrete. Stability comes from migrating and validating consumers, one family at a time.</p></article></div><div className="tidy-callout"><strong>Evidence to collect next</strong><p>Task-based usability sessions, keyboard and VoiceOver results, source-to-token coverage, adopted component counts and regression rates. These are proposed measures, not achieved outcomes.</p></div></Page> };
export const ReleaseChecklist: Story = { render: () => <Page eyebrow="Practice / Release" title="Review before calling it stable" intro="This checklist makes the remaining product adoption work explicit. Hosting makes the specification available; it does not make every pattern production-ready."><Table headings={['Gate','Evidence required']} rows={[
['Token consistency','Generated CSS and TypeScript match the committed Figma snapshot.'],
['Component behavior','Named variant stories and interaction assertions pass.'],
['Visual quality','Light/Dark, focus, long text, narrow layouts and reduced motion inspected.'],
['Accessibility','Automated audit plus keyboard, VoiceOver and low-vision review.'],
['Electron integration','Real folder selection, permissions, run progress, AI errors and undo tested in the app.'],
['Operational safety','Scheduling lifetime, duplicate archive collision and overwrite limitations verified.'],
['Adoption','At least one production consumer; migration and version notes reviewed.'],
['Documentation','Source mapping, known gaps and ownership updated.'],
]} /></Page> };
