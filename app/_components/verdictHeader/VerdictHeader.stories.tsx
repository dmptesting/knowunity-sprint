import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { VerdictHeader } from './VerdictHeader';

/**
 * Not a Figma component. Screen 06 draws this pairing loose on the frame —
 * see "Why it exists" below.
 */
const meta = {
  title: 'Components/verdictHeader',
  component: VerdictHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The verdict that opens a result screen: the word, coloured by how it went.',
          '',
          '**USE:** at the top of a result state, above the transcript and the feedback.',
          '',
          "**DON'T:** reach for it to label anything that isn't a judgement of an attempt. It is the recall loop's verdict, not a generic status chip.",
          '',
          '### Why it exists',
          '',
          'Figma screen 06 draws this as a bare `Icon Slot` sitting loose on the frame with a text node under it. design-system.md is explicit about what that means: *"If you\'re placing an icon directly on a screen with no parent component around it, that\'s a sign you\'re missing a component."* This is that component (SPEC.md, Step 0a).',
          '',
          '### No mark',
          '',
          "This was built as an icon-plus-word pairing, reproducing the green check-circle Figma 06 draws with a bare `Icon Slot`. The checkmark was **dropped on the designer's instruction**: on a pass the result screen now carries a large `giggling` mascot, and a tick beside it was one affirmation too many.",
          '',
          'Nothing draws a mark on a miss either — SPEC.md is explicit that *"the distinction stays in copy"* — so the component is the word alone. The word was kept when the mark went because it still carries the verdict for anyone who cannot read the mascot\'s expression.',
          '',
          '### Departures from Figma',
          '',
          "- **The disc is 64px, not 60.** 60 is not a token step; snapped to the nearest real one, `Space/1600`.",
          "- **The glyph is Material Symbols `check` on a filled disc, not a `check-circle` component.** The React library has no check-circle — `PathNodeIcons` dropped it — so the disc is drawn from `accent/green/bold` with the existing `CheckIcon` knocked out in `accent/green/onBold`. That is what 06 renders.",
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--dimension-space-600)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    verdict: {
      control: 'inline-radio',
      options: ['pass', 'partial', 'fail'],
    },
    label: { control: 'text' },
  },
  args: { verdict: 'pass', label: 'Correct' },
} satisfies Meta<typeof VerdictHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The one verdict Figma draws, now the word alone on `accent/green/bold`. */
export const Pass: Story = {
  name: 'verdict=pass',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Correct')).toBeVisible();
  },
};

/** A miss. Neutral, per SPEC.md — no error or warning treatment. */
export const Partial: Story = {
  name: 'verdict=partial',
  args: { verdict: 'partial', label: 'Almost' },
};

/** The other miss. Structurally identical to partial; only the copy differs. */
export const Fail: Story = {
  name: 'verdict=fail',
  args: { verdict: 'fail', label: 'Not quite' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Not quite')).toBeVisible();
    // Nothing but the word: no mark on any verdict now.
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
  },
};

/** All three together, which is the only way to judge whether they read as one family. */
export const AllThree: Story = {
  name: 'All three verdicts',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--dimension-space-800)',
      }}
    >
      <VerdictHeader verdict="pass" label="Correct" />
      <VerdictHeader verdict="partial" label="Almost" />
      <VerdictHeader verdict="fail" label="Not quite" />
    </div>
  ),
};
