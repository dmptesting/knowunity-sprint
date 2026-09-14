import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { StatTile } from './StatTile';

/**
 * The component description below is statTile's own `.description` field in
 * Figma, followed by the places this build knowingly departs from the file.
 */
const meta = {
  title: 'Components/statTile',
  component: StatTile,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'A compact badge that surfaces a single numeric stat — XP earned, number correct, or time taken — each in its own accent with its own icon.',
          '',
          '**USE:** inline after a recall attempt or on a summary screen when one number deserves emphasis.',
          '',
          "**DON'T:** use it for multi-line content or anything longer than a short label + short value; it isn't a card.",
          '',
          "_Adapted from the component's `.description` field in Figma, which described a single accent/blue tile._",
          '',
          '### The three stats',
          '',
          '| `stat` | Accent | Icon | Default label |',
          '|---|---|---|---|',
          '| `xp` | `accent/coral` | `bolt` | XP |',
          '| `correct` | `accent/green` | `target` | Correct |',
          '| `time` | `accent/blue` | `timer` (a stopwatch) | Time |',
          '',
          'Each accent is used the same way: `subtle` fill, `bold` stroke and icon, `onSubtle` label, `text/primary` value. Label contrast on the fill is 6.94:1 (coral), 9.20:1 (green) and 7.40:1 (blue). `accent/brand` was ruled out — its label measures 4.10:1, under the 4.5:1 minimum.',
          '',
          '### Also worth knowing',
          '',
          '- **The accents are hue-named debt** (design-system.md). These reuse families that already exist rather than adding new hue-named tokens.',
          '- **The icon is decorative.** The label already says what the number is, so the icon is hidden from screen readers.',
          '- **The summary screen is the only place several tiles appear together**, and it now passes `stat`.',
          '',
          '### Departures from Figma',
          '',
          '- **Three stats, not one tile.** Figma has a single tile in `accent/blue` with no variants. `stat` is code-only for now.',
          '- **The label is one type step up:** Greed/Caption M Bold (`font/size/xs`, 12px) instead of Figma\'s Caption S Bold (`font/size/2xs`, 9px).',
          '- **An icon sits before the value**, at `Icon/200` — the value\'s own line height, so the tile is no taller. Material Symbols, like the rest of the library.',
          '- **It is a description list, not two bare text layers.** `<dl>`/`<dt>`/`<dd>` ties the label to its value for screen readers.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    stat: {
      control: 'inline-radio',
      options: ['xp', 'correct', 'time'],
      description: 'Which stat: sets the accent, the icon and the default label. Not a Figma property.',
    },
    label: { control: 'text', description: 'Overrides the default label. Not a Figma property.' },
    value: { control: 'text', description: 'The number itself. Not a Figma property.' },
  },
  args: { stat: 'xp', value: '+18' },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Resolves a colour token the way the browser paints it. */
function resolveColor(token: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/** XP earned — coral, with a bolt. */
export const Xp: Story = {
  name: 'stat=xp',
  args: { stat: 'xp', value: '+18' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('XP')).toBeVisible();
    await expect(canvas.getByText('+18')).toBeVisible();
    const tile = canvasElement.querySelector('dl')!;
    await expect(getComputedStyle(tile).borderTopColor).toBe(resolveColor('--color-accent-coral-bold'));
  },
};

/** Number correct — green, with a target. */
export const Correct: Story = {
  name: 'stat=correct',
  args: { stat: 'correct', value: '3/4' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Correct')).toBeVisible();
    const tile = canvasElement.querySelector('dl')!;
    await expect(getComputedStyle(tile).borderTopColor).toBe(resolveColor('--color-accent-green-bold'));
  },
};

/** Time taken — blue, with a stopwatch. */
export const Time: Story = {
  name: 'stat=time',
  args: { stat: 'time', value: '2:09' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Time')).toBeVisible();
    const tile = canvasElement.querySelector('dl')!;
    await expect(getComputedStyle(tile).borderTopColor).toBe(resolveColor('--color-accent-blue-bold'));
  },
};

/**
 * The three stats the sprint's summary screen shows — XP, number correct and
 * time — which is the only place several tiles appear together. Each reads as
 * its own stat by colour and icon, not colour alone.
 */
export const SummaryRow: Story = {
  name: 'On the summary screen',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--dimension-space-200)' }}>
      <StatTile stat="xp" value="+18" />
      <StatTile stat="correct" value="3/4" />
      <StatTile stat="time" value="2:09" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tiles = Array.from(canvasElement.querySelectorAll('dl'));
    await expect(tiles).toHaveLength(3);
    const borders = tiles.map((t) => getComputedStyle(t).borderTopColor);
    await expect(new Set(borders).size).toBe(3);
    // One decorative icon per tile, hidden from screen readers.
    for (const tile of tiles) {
      await expect(tile.querySelectorAll('[aria-hidden="true"] svg')).toHaveLength(1);
    }
  },
};
