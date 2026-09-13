import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MacToggle } from '../../src/app/components/controls/MacToggle';
import { MacSelect } from '../../src/app/components/controls/MacSelect';
import { FolderCard } from '../../src/app/components/FolderCard';
import { CategoryRuleCard } from '../../src/app/components/sections/CategoryRuleCard';
import { AiCommandBar } from '../../src/app/components/sections/AiCommandBar';
import { StatusBar } from '../../src/app/components/StatusBar';
import { NoticeDialog } from '../../src/app/components/NoticeDialog';
import { createInitialCategories } from '../../src/app/constants';
import { Button } from '../components';
import { Page, Specimen } from './shared';
const meta = { title: 'In the app/Current React components', parameters: { a11y: { test: 'todo' }, docs: { description: { component: 'Direct imports from src/app/components. Callbacks use local demonstration state; no Electron or AI calls are made. These examples preserve existing contrast, keyboard and copy limitations for review. Accessibility findings are reported as TODO rather than declaring the existing app compliant. See Practice/Source Mapping for adoption work.' } } }, decorators: [(Story) => <Page eyebrow="Production source / Comparison" title="What the app uses today" intro="These specimens import the actual React components. Use them to review differences from the proposed Figma-aligned library. Browser examples do not exercise Electron file operations."><Story /></Page>] } satisfies Meta;
export default meta;
type Story = StoryObj;
function ToggleExample() { const [checked,setChecked]=useState(true); return <div className="tidy-row"><span id="source-toggle-label">Organize documents</span><MacToggle checked={checked} onCheckedChange={setChecked} aria-labelledby="source-toggle-label" /></div>; }
export const Toggle: Story = { render: () => <ToggleExample /> };
function SelectExample() { const [value,setValue]=useState('skip'); return <MacSelect label="Duplicate policy" value={value} onChange={setValue} options={[{value:'skip',label:'Skip'},{value:'rename',label:'Rename'},{value:'archive',label:'Archive'},{value:'overwrite',label:'Overwrite'}]} />; }
export const Select: Story = { render: () => <SelectExample /> };
function FolderExample({ empty=false }: { empty?: boolean }) { const [path,setPath]=useState(empty ? '' : '/Users/demo/Downloads');return <FolderCard label="Source" path={path} onPathChange={setPath} onSelect={()=>setPath('/Users/demo/Documents')} />; }
export const Folder: Story = { render: () => <FolderExample /> };
export const EmptyFolder: Story = { render: () => <FolderExample empty /> };
function RuleExample({index=0}: {index?: number}) { const [category,setCategory]=useState(createInitialCategories()[index]);const [expanded,setExpanded]=useState(true);return <CategoryRuleCard category={category} expanded={expanded} matchesSearch searching={false} searchQuery="" onToggleExpanded={()=>setExpanded(!expanded)} onPatch={patch=>setCategory({...category,...patch})} onToggleExtension={extension=>setCategory({...category,extensions:category.extensions.includes(extension)?category.extensions.filter(e=>e!==extension):[...category.extensions,extension]})} />; }
export const DocumentsRule: Story = { render: () => <RuleExample /> };
export const ImagesRule: Story = { render: () => <RuleExample index={1} /> };
export const AudioRule: Story = { render: () => <RuleExample index={2} /> };
export const VideoRule: Story = { render: () => <RuleExample index={3} /> };
export const ArchivesRule: Story = { render: () => <RuleExample index={4} /> };
function AiExample({success=false,error=false,busy=false}: {success?:boolean;error?:boolean;busy?:boolean}) {const [value,setValue]=useState('');const [submitted,setSubmitted]=useState(success);return <AiCommandBar value={value} onValueChange={setValue} onSubmit={()=>setSubmitted(true)} busy={busy} feedback={error?{type:'error',message:'Connection unavailable. Try again.'}:submitted?{type:'success',message:'Rules updated. No files have moved.'}:null} onOpenAdvanced={()=>setValue('Organize screenshots by date')} />;}
export const AIEntry: Story = { render: () => <AiExample /> };
export const AISuccess: Story = { render: () => <AiExample success /> };
export const AIError: Story = { render: () => <AiExample error /> };
export const AIProcessing: Story = { render: () => <AiExample busy /> };
export const RunStatus: Story = { render: () => <div style={{minWidth:1000}}><StatusBar runState="completed" metrics={{moved:2,renamed:1,duplicates:1,errors:0,timestamp:new Date('2026-09-12T09:00:00'),operations:[]}} /></div> };
function NoticeExample() { const [open,setOpen]=useState(false);return <><Button intent="secondary" onClick={()=>setOpen(true)}>Show app notice</Button><NoticeDialog open={open} onOpenChange={setOpen} message="Choose a source and destination before running Tidy." /></>; }
export const Notice: Story = { render: () => <NoticeExample /> };
export const ToggleGeometry: Story = { render: () => <div className="tidy-grid">{(['sm','md'] as const).map(size=><Specimen key={size} label={size}><MacToggle checked size={size} onCheckedChange={()=>{}} aria-label={size+' switch specimen'} /></Specimen>)}</div> };
