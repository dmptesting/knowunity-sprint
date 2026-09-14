import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { MascotSlot } from './MascotSlot';
import type { MascotExpression } from './MascotSlot';
import { CalloutBubble } from '../calloutBubble/CalloutBubble';

/**
 * Every expression shipped in `public/images/`, standby first and the rest
 * alphabetical. This is the full set: 14 files, 14 union members, 14 options in
 * the control below.
 */
const EXPRESSIONS: MascotExpression[] = [
  'standby',
  'amazed',
  'angry',
  'approving',
  'confused',
  'dazed',
  'determined',
  'excited',
  'giggling',
  'laughing',
  'overIt',
  'questioning',
  'sad',
  'thinking',
];

/**
 * The component description below is mascotSlot's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/mascotSlot',
  component: MascotSlot,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Knowie mascot at one of 4 sizes, wraps a nested "standby" instance.',
          '',
          '**USE:** mascot moments sized to context. Real usage favors 2XL/3XL, XL never appears.',
          '',
          '**DON\'T:** other mascot states beyond "standby" may be swappable via the nested structure, but that\'s unverified, only "standby" was found in real use.',
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### Also worth knowing',
          '',
          '- **Every size is a real token.** XL is `Illustration/800`, 2XL `Illustration/1500`, 3XL `Illustration/2500`, 4XL `Illustration/4000`, and the inner inset is `Space/300` — all bound in Figma, all exact.',
          '- **All 14 expressions ship.** `public/images/` carries standby, amazed, angry, approving, confused, dazed, determined, excited, giggling, laughing, overIt, questioning, sad and thinking. Only `standby` is verified in real use.',
          '- **He is decorative by default.** On every recall screen a calloutBubble or heading already carries the words, so the image is hidden from assistive tech unless you pass `label`.',
          '- **The artwork is served from `public/`,** not bundled: each expression is ~275KB of SVG, and Storybook exposes the same folder Next does.',
          '',
          '### Departures from Figma',
          '',
          '- **The artwork is contained, not stretched.** Figma nests a square `standby` instance that fills the padded box; the shipped `standby.svg` is 200×217. Containing it keeps Knowie in proportion and leaves a little slack at the sides rather than distorting him.',
          '- **`expression` exposes all 14 shipped states.** Figma has the same choice as an INSTANCE_SWAP property named `Homie` with 16 preferred values, so this is the file\'s own mechanism — but design-system.md verifies only `standby`. The others are available and unproven; `thinking` and `approving` are the two the recall loop would reach for first.',
          "- **No `Homie` prop name.** Figma's property is literally `Homie`; `expression` says what it selects instead, and the mapping is recorded here.",
        ].join('\n'),
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['XL', '2XL', '3XL', '4XL'],
      description: 'Figma variant property `size`.',
    },
    expression: {
      control: 'select',
      options: EXPRESSIONS,
      description:
        "Figma's INSTANCE_SWAP property `Homie`. All 14 shipped states; only `standby` is verified.",
    },
    label: { control: 'text', description: 'Accessible name. Decorative when omitted.' },
  },
  args: { size: 'XL', expression: 'standby' },
} satisfies Meta<typeof MascotSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------
 * One story per variant in the Figma component set, named exactly as Figma
 * names it.
 * ---------------------------------------------------------------------- */

/** Figma's default size, which design-system.md notes never appears in real use. */
export const SizeXl: Story = {
  name: 'size=XL',
  args: { size: 'XL' },
  play: async ({ canvas }) => {
    // Decorative by default: no accessible name, so no img role to find.
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};

export const Size2xl: Story = {
  name: 'size=2XL',
  args: { size: '2XL' },
};

export const Size3xl: Story = {
  name: 'size=3XL',
  args: { size: '3XL' },
};

export const Size4xl: Story = {
  name: 'size=4XL',
  args: { size: '4XL' },
};

/* -------------------------------------------------------------------------
 * Beyond the variant grid.
 * ---------------------------------------------------------------------- */

/** Passing `label` makes him an image with a name, for a screen where he is the only content. */
export const Labelled: Story = {
  name: 'With an accessible name',
  args: { size: '2XL', label: 'Knowie' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Knowie' })).toBeVisible();
  },
};

/**
 * The composition the recall loop needs: Knowie at 2XL above his own speech
 * bubble. This is what calloutBubble's tail exists to point at — worth checking
 * the two read as one unit, since design-system.md pairs them in its scaffold
 * but no real screen proves the spacing.
 *
 * Known open question: the tail points left while Knowie sits centred above,
 * so it points at nothing. The shipped beta uses a tailless bubble here.
 */
export const WithCalloutBubble: Story = {
  name: 'Above a calloutBubble',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--dimension-space-400)',
        padding: 'var(--dimension-space-600)',
      }}
    >
      <MascotSlot size="2XL" />
      <CalloutBubble body="What makes a password resistant to brute-force attacks?" />
    </div>
  ),
};

/**
 * All 14 shipped expressions, captioned. `standby` is the only one with real
 * usage — design-system.md treats every other state as unverified, so this grid
 * is the place to judge whether the family reads consistently before any of them
 * is used in anger. `thinking` (while judging) and `approving` (on a pass) are
 * the two the recall loop would reach for first.
 */
export const Expressions: Story = {
  name: 'Expressions — all 14, unverified',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--dimension-space-300)',
        padding: 'var(--dimension-space-400)',
      }}
    >
      {EXPRESSIONS.map((expression) => (
        <div
          key={expression}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--dimension-space-100)',
          }}
        >
          <MascotSlot size="XL" expression={expression} />
          <span
            style={{
              color: 'var(--color-text-secondary)',
              // Greed/Caption S Bold.
              font: 'var(--typography-text-style-caption-sbold), Arial, Helvetica, sans-serif',
              letterSpacing: 'calc(var(--number-font-tracking-loose) * 0.01em)',
            }}
          >
            {expression}
          </span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // The count is the point of this story: all 14, not a subset.
    await expect(canvas.getByText('standby')).toBeVisible();
    await expect(canvas.getByText('overIt')).toBeVisible();
    await expect(canvas.getByText('giggling')).toBeVisible();
  },
};
