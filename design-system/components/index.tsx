import React, { useId, useRef, useState, useEffect } from 'react';
import { Folder, Document, ArrowRight, Check, Warning, Sparkles, Play, X, ChevronDown, Clock, Settings } from '../../src/app/components/icons';

export type State = 'default' | 'hover' | 'pressed' | 'focus' | 'disabled' | 'loading';
export type Intent = 'primary' | 'secondary' | 'destructive';
export function Button({ children = 'Run Tidy', intent = 'primary', state = 'default', icon = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { intent?: Intent; state?: State; icon?: boolean }) {
  return <button {...props} type={props.type ?? 'button'} className={'tidy-button ' + (props.className ?? '')} data-intent={intent} data-state={state} disabled={props.disabled || state === 'disabled' || state === 'loading'} aria-busy={state === 'loading' || undefined}>{(icon || state === 'loading') && <span aria-hidden="true">{state === 'loading' ? <Clock /> : <Play />}</span>}{state === 'loading' ? 'Organizing…' : children}</button>;
}
export function IconButton({ label = 'Settings', density = 'compact', state = 'default', onClick }: { label?: string; density?: 'compact' | 'expanded'; state?: Exclude<State, 'loading'> | 'selected'; onClick?: () => void }) {
  return <button type="button" className="tidy-icon-button" data-density={density} data-state={state} aria-label={label} aria-pressed={state === 'selected'} disabled={state === 'disabled'} onClick={onClick}><Settings aria-hidden="true" /></button>;
}
export function Toggle({ label = 'Organize documents', checked = true, size = 'medium', state = 'default', onChange }: { label?: string; checked?: boolean; size?: 'small' | 'medium'; state?: 'default' | 'focus' | 'disabled'; onChange?: (checked: boolean) => void }) {
  const [value, setValue] = useState(checked);
  useEffect(() => setValue(checked), [checked]);
  return <button type="button" role="switch" aria-checked={value} aria-label={label} className="tidy-toggle" data-size={size} data-state={state} disabled={state === 'disabled'} onClick={() => { setValue(!value); onChange?.(!value); }}><span /></button>;
}
export function TextField({ label = 'Destination path', state = 'empty', value, helper = 'Choose a folder you can write to.' }: { label?: string; state?: 'empty' | 'filled' | 'hover' | 'focus' | 'error' | 'disabled'; value?: string; helper?: string }) {
  const id = useId();
  return <div className="tidy-field" data-state={state}><label htmlFor={id}>{label}</label><input key={state + value} id={id} defaultValue={value ?? (state === 'empty' ? '' : '~/Documents/Organized')} placeholder="e.g. ~/Documents/Organized" disabled={state === 'disabled'} aria-invalid={state === 'error'} aria-describedby={id + '-hint'} /><p id={id + '-hint'}>{state === 'error' ? 'This folder cannot be accessed. Choose another location.' : helper}</p></div>;
}
export function Select({ label = 'Resolve duplicates', state = 'default' }: { label?: string; state?: 'default' | 'hover' | 'focus' | 'open' | 'error' | 'disabled' }) {
  const id = useId();
  return <div className="tidy-field" data-state={state}><label htmlFor={id}>{label}</label><select id={id} disabled={state === 'disabled'} aria-invalid={state === 'error'} aria-describedby={state === 'error' ? id + '-error' : undefined} size={state === 'open' ? 4 : undefined} defaultValue="skip"><option value="skip">Skip existing files</option><option value="rename">Rename incoming files</option><option value="archive">Archive duplicates</option><option value="overwrite">Overwrite existing files</option></select>{state === 'error' && <p id={id + '-error'}>Choose how to handle existing files.</p>}</div>;
}
export function ExtensionChip({ label = '.pdf', selected = true, state = 'default' }: { label?: string; selected?: boolean; state?: 'default' | 'hover' | 'focus' | 'disabled' }) {
  const [value, setValue] = useState(selected);
  useEffect(() => setValue(selected), [selected]);
  return <button type="button" className="tidy-chip" aria-pressed={value} data-state={state} disabled={state === 'disabled'} onClick={() => setValue(!value)}>{value && <Check aria-hidden="true" />}{label}</button>;
}
export type Tone = 'neutral' | 'information' | 'success' | 'warning' | 'error' | 'ai';
const toneIcons = { neutral: Clock, information: Document, success: Check, warning: Warning, error: Warning, ai: Sparkles };
const toneLabels = { neutral: 'Ready', information: 'Preview', success: 'Complete', warning: 'Review needed', error: 'Failed', ai: 'AI suggested' };
export function StatusBadge({ tone = 'neutral', label }: { tone?: Tone; label?: string }) {
  const Icon = toneIcons[tone];
  return <span className="tidy-badge" data-tone={tone}><Icon aria-hidden="true" />{label ?? toneLabels[tone]}</span>;
}
export function FolderCard({ role = 'source', state = 'filled' }: { role?: 'source' | 'destination'; state?: 'empty' | 'filled' | 'drag' | 'editing' | 'error' }) {
  const [path, setPath] = useState(state === 'empty' || state === 'drag' ? '' : role === 'source' ? '~/Downloads' : '~/Documents/Organized');
  const [editing, setEditing] = useState(state === 'editing');
  const label = role === 'source' ? 'Source' : 'Destination';
  return <section role="group" className="tidy-card tidy-folder" data-state={state} aria-label={label + ' folder'}><Folder aria-hidden="true" /><div className="tidy-grow"><span className="tidy-caption">{label}</span>{editing ? <label className="tidy-field"><span className="tidy-sr-only">{label} path</span><input value={path} onChange={e => setPath(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false); }} /></label> : <p className="tidy-path">{path || (state === 'drag' ? 'Release to choose this folder' : 'Choose a folder to get started')}</p>}{state === 'error' && <p className="tidy-error">Folder unavailable. Choose another location.</p>}</div><Button intent="secondary" onClick={() => setEditing(!editing)}>{editing ? 'Save path' : 'Edit path'}</Button></section>;
}
export function RuleCard({ category = 'Documents', state = 'collapsed' }: { category?: 'Documents' | 'Images' | 'Audio' | 'Video' | 'Archives'; state?: 'collapsed' | 'expanded' | 'disabled' }) {
  const [expanded, setExpanded] = useState(state === 'expanded');
  const id = useId();
  const extensions = { Documents: ['.pdf', '.docx', '.txt', '.xlsx'], Images: ['.jpg', '.png', '.heic', '.svg'], Audio: ['.mp3', '.wav', '.m4a', '.flac'], Video: ['.mp4', '.mov', '.mkv', '.webm'], Archives: ['.zip', '.tar', '.gz', '.7z'] };
  return <section className="tidy-card"><div className="tidy-row"><Document aria-hidden="true" /><button className="tidy-disclosure tidy-grow" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)}>{category}<ChevronDown aria-hidden="true" /></button><Toggle label={'Enable ' + category} checked={state !== 'disabled'} /></div>{expanded && <div id={id} className="tidy-stack tidy-rule-body"><div className="tidy-row"><span className="tidy-grow">Create subfolders</span><Toggle size="small" label={'Create ' + category + ' subfolders'} /></div><p className="tidy-muted">Select file types to include</p><div className="tidy-wrap">{extensions[category].map(ext => <ExtensionChip key={ext} label={ext} />)}</div></div>}</section>;
}
export function AiCommand({ state = 'empty' }: { state?: 'empty' | 'entered' | 'processing' | 'success' | 'error' | 'unavailable' }) {
  const [current, setCurrent] = useState(state);
  const [prompt, setPrompt] = useState(state === 'empty' ? '' : 'Organize screenshots by date');
  const id = useId();
  return <section className="tidy-card tidy-ai"><div className="tidy-row"><Sparkles aria-hidden="true" /><label htmlFor={id}>Ask Tidy AI</label><StatusBadge tone="ai" label="Rule assistance" /></div><textarea id={id} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe how you want to organize your files…" disabled={current === 'processing' || current === 'unavailable'} /><div className="tidy-row"><p className="tidy-grow tidy-muted" role="status">{current === 'success' ? 'Rules updated. No files have moved.' : current === 'error' ? 'Couldn’t generate rules. Your existing rules are unchanged.' : current === 'processing' ? 'Interpreting your request…' : current === 'unavailable' ? 'AI unavailable. You can still configure rules manually.' : 'Review the generated rules before running Tidy.'}</p><Button intent="secondary" disabled={!prompt || current === 'processing' || current === 'unavailable'} onClick={() => setCurrent('success')}>Preview rules</Button></div></section>;
}
export function PreviewRow({ action = 'move', original = 'Invoice.pdf', completed = false }: { action?: 'move' | 'rename' | 'duplicate' | 'error'; original?: string; completed?: boolean }) {
  return <div className="tidy-card tidy-preview-row"><Document aria-hidden="true" /><div className="tidy-grow"><strong>{original}</strong><p className="tidy-muted">~/Downloads</p></div><ArrowRight aria-hidden="true" /><div className="tidy-grow"><strong>{action === 'rename' ? '2026-09_Invoice.pdf' : original}</strong><p className="tidy-muted">~/Documents/Organized</p></div><StatusBadge tone={action === 'error' ? 'error' : action === 'duplicate' ? 'warning' : action === 'rename' ? 'ai' : 'information'} label={action === 'error' ? 'Folder unavailable' : action === 'duplicate' ? 'Duplicate · Skip' : completed ? (action === 'rename' ? 'Renamed and moved' : 'Moved') : action === 'rename' ? 'Suggested rename' : 'Move'} /></div>;
}
export function Feedback({ tone = 'information', title, children }: { tone?: Exclude<Tone, 'neutral' | 'ai'> | 'empty'; title?: string; children?: React.ReactNode }) {
  return <div className="tidy-card tidy-feedback" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}><StatusBadge tone={tone === 'empty' ? 'neutral' : tone} label={title ?? { information: 'Review before organizing', success: 'Organization complete', warning: 'Some files need review', error: 'Couldn’t organize these files', empty: 'No matching files' }[tone]} /><p>{children ?? { information: 'No files move until you confirm this manual run.', success: 'Review the recorded operations in History.', warning: 'Review duplicate handling before continuing.', error: 'Check the destination and try again. Your rules are saved.', empty: 'Try another source folder or adjust the selected file types.' }[tone]}</p></div>;
}
export function RunStatus({ state = 'idle' }: { state?: 'idle' | 'scanning' | 'running' | 'completed' | 'error' }) {
  return <div className="tidy-card tidy-row" role="status"><StatusBadge tone={state === 'error' ? 'error' : state === 'completed' ? 'success' : 'information'} label={{ idle: 'Ready to organize', scanning: 'Scanning files…', running: 'Organizing…', completed: 'Organization complete', error: 'Finished with errors' }[state]} /><span className="tidy-grow" />{state === 'running' ? <progress aria-label="Organization progress" value={64} max={100} /> : <span className="tidy-muted">{state === 'completed' ? '2 moved · 1 renamed · 1 duplicate skipped' : state === 'error' ? '1 moved · 1 failed' : 'No files have moved'}</span>}</div>;
}
export function Schedule({ frequency = 'manual' }: { frequency?: 'manual' | 'daily' | 'weekly' | 'monthly' }) {
  const [value, setValue] = useState(frequency);
  const id = useId();
  return <section className="tidy-card tidy-stack"><div className="tidy-row"><Clock aria-hidden="true" /><h2>Schedule</h2></div><div className="tidy-field"><label htmlFor={id}>Run frequency</label><select id={id} value={value} onChange={e => setValue(e.target.value as typeof value)}>{['manual', 'daily', 'weekly', 'monthly'].map(v => <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>)}</select></div>{value !== 'manual' && <><label className="tidy-field">Time<input type="time" defaultValue="09:00" /></label><Feedback tone="warning" title="Scheduled runs skip preview">Keep Tidy open. {value === 'weekly' ? 'Runs every Monday.' : value === 'monthly' ? 'Runs on the first day of each month.' : 'Runs every day.'} Verify your rules and duplicate policy first. This demonstration does not save a schedule.</Feedback></>}</section>;
}
export function Dialog({ kind = 'notice' }: { kind?: 'notice' | 'confirm' | 'destructive' }) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const id = useId();
  return <><Button intent={kind === 'destructive' ? 'destructive' : 'secondary'} onClick={event => { returnFocus.current = event.currentTarget; ref.current?.showModal(); }}>Open {kind} dialog</Button><dialog className="tidy-dialog" ref={ref} onClose={() => returnFocus.current?.focus()} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); ref.current?.close(); } }} aria-labelledby={id} aria-describedby={id + '-description'}><h2 id={id}>{kind === 'notice' ? 'Choose both folders' : kind === 'confirm' ? 'Start organizing?' : 'Overwrite existing files?'}</h2><p id={id + '-description'}>{kind === 'notice' ? 'Select a source and destination before running Tidy.' : kind === 'confirm' ? 'Apply the two changes you reviewed. One duplicate will be skipped.' : 'Existing destination contents may be replaced. Undo cannot restore overwritten bytes.'}</p><form method="dialog" className="tidy-row"><Button intent="secondary" type="submit" autoFocus>{kind === 'notice' ? 'OK' : 'Cancel'}</Button>{kind !== 'notice' && <Button type="submit" intent={kind === 'destructive' ? 'destructive' : 'primary'}>{kind === 'confirm' ? 'Start organizing' : 'Overwrite files'}</Button>}</form></dialog></>;
}
