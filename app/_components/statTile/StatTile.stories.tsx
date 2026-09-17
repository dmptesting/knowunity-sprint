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
          'A compact tile that surfaces a single stat — XP earned, score, or time taken — each in its own accent with its own icon: a coloured chip naming the stat, and the number below it on the page’s own dark ground.',
          '',
          '**USE:** inline after a recall attempt or on a summary screen when one number deserves emphasis.',
          '',
          "**DON'T:** use it for multi-line content or anything longer than a short label + short value; it isn't a card.",
          '',
          '### The three stats',
          '',
          '| `stat` | Accent | Icon | Default label |',
          '|---|---|---|---|',
          '| `xp` | `accent/blue` | `bolt` | XP |',
          '| `score` | `accent/green` | `target` | Score |',
          '| `blazing` | `accent/brand` | `timer` (a stopwatch) | Time |',
          '',
          'Each accent is used the same way: the tile is `bold`, the label on it is `onBold`, and the value panel is `background/page` with its icon and number in `bold` again. Contrast, label then value: 6.64:1 / 7.35:1 (blue), 7.49:1 / 8.49:1 (green), 5.61:1 / 5.60:1 (brand). `accent/brand` works here, having been ruled out of the tile’s previous subtle-fill treatment at 4.10:1.',
          '',
          '### Also worth knowing',
          '',
          '- **The accents are hue-named debt** (design-system.md). These reuse families that already exist rather than adding new hue-named tokens.',
          '- **The icon is decorative.** The label already says what the number is, so the icon is hidden from screen readers.',
          '- **The summary screen is the only place several tiles appear together**, and it passes all three stats.',
          '',
          '### Departures from Figma',
          '',
          '- **`blazing` names the variant, not the label.** Figma writes "BLAZING" over the elapsed time, which would praise a slow run as readily as a fast one. The visible label is "Time"; callers can override it.',
          '- **Sentence case.** Figma sets the labels uppercase — `XP` / `SCORE` / `BLAZING`. `XP` stays as it is, being an abbreviation; the others become "Score" and "Time".',
          '- **The numerals fall back to Greed Standard.** Figma’s text style is `Greed Condensed/Stat`, but no webfont ships for the condensed family, so the shipped face leads the fallback chain at the same weight and size.',
          '- **The value is 21px, not 24.** Figma drew 24, which is not a step on the type scale; the text style snaps to `font/size/lg`. The icon likewise snaps to `Icon/300` (24px) from Figma’s 29px.',
          '- **The tile hugs its content** rather than sitting at Figma’s fixed 108.25px, which is not a token either.',
          '- **The invisible stroke is dropped.** Figma gives the tile a 2px stroke in the same `bold` token as its fill, so it paints nothing.',
          '- **It is a description list, not two bare text layers.** `<dl>`/`<dt>`/`<dd>` ties the label to its value for screen readers.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    stat: {
      control: 'inline-radio',
      options: ['xp', 'score', 'blazing'],
      description: 'Which stat: sets the accent, the icon and the default label.',
    },
    label: { control: 'text', description: 'Overrides the default label.' },
    value: { control: 'text', description: 'The number itself. A text layer in Figma too.' },
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

/** XP earned — blue, with a bolt. */
export const Xp: Story = {
  name: 'stat=xp',
  args: { stat: 'xp', value: '+18' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('XP')).toBeVisible();
    await expect(canvas.getByText('+18')).toBeVisible();
    const tile = canvasElement.querySelector('dl')!;
    await expect(getComputedStyle(tile).backgroundColor).toBe(resolveColor('--color-accent-blue-bold'));
  },
};

/** Score — green, with a target. */
export const Score: Story = {
  name: 'stat=score',
  args: { stat: 'score', value: '3/4' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Score')).toBeVisible();
    const tile = canvasElement.querySelector('dl')!;
    await expect(getComputedStyle(tile).backgroundColor).toBe(resolveColor('--color-accent-green-bold'));
  },
};

/**
 * Time taken — brand, with a stopwatch. The variant is `blazing`, after the
 * Figma tile; the label reads "Time", which is true at any speed.
 */
export const Blazing: Story = {
  name: 'stat=blazing',
  args: { stat: 'blazing', value: '2:09' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Time')).toBeVisible();
    await expect(canvas.queryByText('Blazing')).toBeNull();
    const tile = canvasElement.querySelector('dl')!;
    await expect(getComputedStyle(tile).backgroundColor).toBe(resolveColor('--color-accent-brand-bold'));
  },
};

/**
 * The value panel sits on `background/page`, so the number keeps its accent
 * against the page's own ground rather than against the coloured tile.
 */
export const PanelGround: Story = {
  name: 'The value panel',
  args: { stat: 'score', value: '10/10' },
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('dd')!;
    await expect(getComputedStyle(panel).backgroundColor).toBe(resolveColor('--color-background-page'));
    await expect(getComputedStyle(panel).color).toBe(resolveColor('--color-accent-green-bold'));
  },
};

/**
 * The three stats the sprint's summary screen shows — XP, score and time —
 * which is the only place several tiles appear together. Each reads as its own
 * stat by colour and icon, not colour alone.
 */
export const SummaryRow: Story = {
  name: 'On the summary screen',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--dimension-space-200)' }}>
      <StatTile stat="xp" value="+18" />
      <StatTile stat="score" value="3/4" />
      <StatTile stat="blazing" value="2:09" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tiles = Array.from(canvasElement.querySelectorAll('dl'));
    await expect(tiles).toHaveLength(3);
    const fills = tiles.map((t) => getComputedStyle(t).backgroundColor);
    await expect(new Set(fills).size).toBe(3);
    // One decorative icon per tile, hidden from screen readers.
    for (const tile of tiles) {
      await expect(tile.querySelectorAll('[aria-hidden="true"] svg')).toHaveLength(1);
    }
  },
};
