import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { HintOverlay } from './HintOverlay';
import { RECALL_SCRIPT } from '../../_recall/script';

const Q3 = RECALL_SCRIPT[2];

const meta = {
  title: 'Screens/Hint overlay',
  component: HintOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The hint, given the whole screen: a close button, the hint large and centred, and one primary action back to the question.',
          '',
          'This replaces the small `hintCard` as the *presentation* of a hint — it is what Figma 08 draws, with the two things 08 lacks: a way out and a way on.',
          '',
          '### Dismissing does not take the hint away',
          '',
          '**The `hintCard` stays on the turn underneath**, for the rest of the question, for the student to glance at while they re-record.',
          '',
          "SPEC.md's verification is explicit — *\"the hint stays visible on screen while re-recording\"* — and a recall answer composed **out loud** is the worst possible moment to make someone hold a sentence in working memory. The overlay is how the hint is read; the card is how it stays available.",
          '',
          'It also means the hint is never unreachable after the XP has been spent on it: "View hint" lives on the result sheet, which is behind them by then.',
          '',
          '### One way out, twice',
          '',
          'The ✕ and "Try again" do the same thing — back to the question. The ✕ is the quick way, the button the explicit one. Escape works too. There is no second destination to learn.',
          '',
          '### It replaces the turn rather than floating over it',
          '',
          'Visually that is the overlay it was asked to be: it covers everything, opaque, because anything showing through is noise behind the one sentence the student stopped to read. Structurally it means there is no focus to trap and no inert background to manage — a great deal more robust than a true modal for the same result. Focus is moved onto the hint on open, since the screen changed without the student moving it.',
          '',
          '### Departures from Figma 08',
          '',
          '- **There is a way out.** 08 floats the hint text with no card, no control and no action — a dead end.',
          '- **The hint is Headline S (21px).** 08 sets it at Body M.',
          '- **The label is Headline S (21px) too,** in `accent/brand/bold`, so "Hint 1" and "Hint 2" read at a glance. Colour, not size, separates it from the hint. The label and hint are `Spotlight`.',
          '- **It keeps the "Hint" label.** 08 has one; so does `hintCard`, so the overlay and the card underneath read as the same thing at two sizes.',
        ].join('\n'),
      },
    },
  },
  args: { body: Q3.hints[0], onDismiss: fn() },
} satisfies Meta<typeof HintOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The first hint, as the student meets it. */
export const Default: Story = {
  name: 'Hint 1',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await expect(canvas.getByText(args.body)).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};

/** The second tier — more pointed, still not the answer. */
export const SecondHint: Story = {
  name: 'Hint 2',
  args: { body: Q3.hints[1] },
};

/** The ✕ does the same thing as the button: back to the question. */
export const CloseButtonDismisses: Story = {
  name: 'Closing with the ✕',
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Close hint' }));
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};

/** Escape too, which an overlay has to honour. */
export const EscapeDismisses: Story = {
  name: 'Closing with Escape',
  play: async ({ args }) => {
    await userEvent.keyboard('{Escape}');
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};

/**
 * The longest hint in the script, to check Headline S still fits the content
 * region at 390px without scrolling.
 */
export const LongHint: Story = {
  name: 'A long hint',
  args: {
    body: RECALL_SCRIPT[1].hints[1],
  },
  play: async ({ canvas, args }) => {
    const main = canvas.getByText(args.body).closest('main')!;
    await expect(main.scrollHeight).toBeLessThanOrEqual(main.clientHeight);
  },
};
