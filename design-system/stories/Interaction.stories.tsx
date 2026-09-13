import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Toggle, Dialog, ExtensionChip, AiCommand } from '../components';
export default { title: 'Practice/Interaction checks', parameters: { docs: { description: { component: 'Executable behavior checks. Run npm run test-storybook to execute in Chromium. These assertions cover specific contracts and do not replace manual assistive-technology review.' } } } } satisfies Meta;
type Story = StoryObj;
export const ToggleKeyboard: Story = { render: () => <Toggle checked={false} label="Organize documents" />, play: async ({canvasElement}) => {
  const toggle=within(canvasElement).getByRole('switch'); toggle.focus(); await userEvent.keyboard(' '); await expect(toggle).toHaveAttribute('aria-checked','true'); await userEvent.keyboard(' '); await expect(toggle).toHaveAttribute('aria-checked','false');
} };
export const ChipSelection: Story = { render: () => <ExtensionChip selected={false} />, play: async ({canvasElement}) => {
  const chip=within(canvasElement).getByRole('button'); await userEvent.click(chip); await expect(chip).toHaveAttribute('aria-pressed','true');
} };
export const DialogFocus: Story = { render: () => <Dialog kind="destructive" />, play: async ({canvasElement}) => {
  const canvas=within(canvasElement); const trigger=canvas.getByRole('button'); await userEvent.click(trigger); const dialog=canvas.getByRole('dialog'); await expect(dialog).toBeVisible(); await expect(within(dialog).getByRole('button',{name:'Cancel'})).toHaveFocus(); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(trigger).toHaveFocus());
} };
export const AIPreservesScope: Story = { render: () => <AiCommand state="entered" />, play: async ({canvasElement}) => {
  const canvas=within(canvasElement); await userEvent.click(canvas.getByRole('button',{name:'Preview rules'})); await expect(canvas.getByRole('status')).toHaveTextContent('Rules updated. No files have moved.');
} };
