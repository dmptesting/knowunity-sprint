import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { HintChips } from './HintChips';
import { RECALL_SCRIPT } from '../../_recall/script';

const HINTS = RECALL_SCRIPT[2].hints;

const meta = {
  title: 'Components/hintChips',
  component: HintChips,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The spent hints, as chips — "Hint 1" in `accent/magenta/bold`, "Hint 2" in `accent/blue/bold` — each reopening its own hint overlay.',
          '',
          '**USE:** under Knowie\'s question on a turn, through `knowieSays`\' attachment row, once a hint has been spent.',
          '',
          "**DON'T:** show the hint text itself. The chip is the way back to it; the overlay is where it is read.",
          '',
          '### Why chips, not the card',
          '',
          'This replaces the `hintCard` that sat on the turn. The card kept the hint *visible* while the student re-recorded; a chip keeps it *one tap away*, for a cleaner turn screen. That is a deliberate move off SPEC.md:303 — "the hint stays visible on screen while re-recording".',
          '',
          '### Both tiers stay reachable',
          '',
          'A student who has seen hint 2 may still want to re-read hint 1, and both were paid for in XP. So spending the second hint adds a chip rather than replacing the first.',
          '',
          '### Built on `chips`',
          '',
          '`chips` gained two things for this, neither of which is in its Figma component set: the `magenta` and `blue` colour variants, and an `onClick` that turns the chip into a real button with a 44px hit area. Size S, because XXS and XS set the label at 9px.',
          '',
          '### Accessible names carry the hint',
          '',
          'Each chip is named "Hint 1: …" with the hint text, so a screen reader hears what it reopens rather than just a tier number.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          gap: 'var(--dimension-space-200)',
          padding: 'var(--dimension-space-600)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: { hints: [HINTS[0]], onOpen: fn() },
} satisfies Meta<typeof HintChips>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One hint spent: a single magenta chip. */
export const OneHint: Story = {
  name: 'Hint 1 spent',
  play: async ({ canvas, args }) => {
    const chip = canvas.getByRole('button', { name: /^Hint 1/ });
    await expect(chip).toBeVisible();
    await userEvent.click(chip);
    await expect(args.onOpen).toHaveBeenCalledWith(0);
  },
};

/** Both spent: magenta then blue, each reopening its own hint. */
export const BothHints: Story = {
  name: 'Both hints spent',
  args: { hints: [HINTS[0], HINTS[1]] },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Hint 2/ }));
    await expect(args.onOpen).toHaveBeenCalledWith(1);
    // Hint 1 is still there after hint 2 is spent.
    await expect(canvas.getByRole('button', { name: /^Hint 1/ })).toBeVisible();
  },
};

/** No hints spent: renders nothing at all. */
export const NoHints: Story = {
  name: 'Nothing spent',
  args: { hints: [] },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};
