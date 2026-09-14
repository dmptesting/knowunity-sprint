import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Reveal, answerSize } from './Reveal';
import { RECALL_SCRIPT } from '../../_recall/script';

/** Question 3 is the one SPEC.md rides down the full ladder to reveal. */
const QUESTION = RECALL_SCRIPT[2];

const meta = {
  title: 'Screens/Reveal',
  component: Reveal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The answer page at the end of the hint ladder. Reached only from the reveal sheet — both hints spent, still a miss — and **never** by skipping, which moves straight on and shows no answer. The question scores zero XP, but the page does not say so — the summary carries the score.',
          '',
          '### Laid out like the hint overlay',
          '',
          'Close, the label "Answer", the answer large and centred, and one primary action. No Knowie and no bubble: the answer is the page\'s whole voice, and the two moments where the screen hands the student a piece of information read the same way.',
          '',
          '- **The ✕ and "Next question" do the same thing.** The question is over, so there is no way back to it — one way out, and it is forward.',
          '- **No progress bar.** The header is the hint overlay\'s, close only. The bar already filled when the reveal sheet rose.',
          '',
          '### The answer sizes to its length',
          '',
          'The label stays at Headline S (21px), matching the hint overlay. The answer steps down the headline scale as it gets longer, so a short answer is as loud as possible and a long one still fits without scrolling:',
          '',
          '| Characters | Style |',
          '|---|---|',
          '| up to 60 | Headline XL (44px) |',
          '| up to 110 | Headline L (33px) |',
          '| up to 160 | Headline M (28px) |',
          '| longer | Headline S (21px) |',
          '',
          '### Composition',
          '',
          '- `Screen` — the scaffold, pinning the header and the action row.',
          '- `AppBar` `leftIconButtonOnly` — close.',
          '- `Spotlight` — the label and the answer.',
          '- `Button` `Primary` / `L` — "Next question".',
        ].join('\n'),
      },
    },
  },
  args: {
    answer: QUESTION.answer,
    onNext: fn(),
  },
} satisfies Meta<typeof Reveal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The screen as the session reaches it: question 3, both hints spent, the
 * answer shown.
 */
export const Default: Story = {
  name: 'Reveal',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Answer', { exact: true })).toBeVisible();
    await expect(canvas.getByText(args.answer)).toBeVisible();

    // No Knowie on this page.
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Next question' }));
    await expect(args.onNext).toHaveBeenCalledTimes(1);

    // Close goes the same way.
    await userEvent.click(canvas.getByRole('button', { name: 'Close answer' }));
    await expect(args.onNext).toHaveBeenCalledTimes(2);
  },
};

/** A short answer takes the largest step, Headline XL. */
export const ShortAnswer: Story = {
  name: 'A short answer',
  args: { answer: 'Length, not complexity.' },
  play: async ({ canvas, args }) => {
    await expect(answerSize(args.answer)).toBe('XL');
    await expect(canvas.getByText(args.answer)).toBeVisible();
  },
};

/** Question 4's answer, 103 characters: Headline L. */
export const MediumAnswer: Story = {
  name: 'A medium answer',
  args: { answer: RECALL_SCRIPT[3].answer },
  play: async ({ args }) => {
    await expect(answerSize(args.answer)).toBe('L');
  },
};

/** Question 2's answer, the longest in the script: Headline S, and still no scroll. */
export const LongAnswer: Story = {
  name: 'A long answer',
  args: { answer: RECALL_SCRIPT[1].answer },
  play: async ({ canvas, args }) => {
    await expect(answerSize(args.answer)).toBe('S');
    const body = canvas.getByText(args.answer);
    const main = body.closest('main')!;
    await expect(main.scrollHeight).toBeLessThanOrEqual(main.clientHeight);
  },
};

/** The zero-XP consequence is not stated on this page. */
export const NoXpNote: Story = {
  name: 'No XP note',
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/XP/)).not.toBeInTheDocument();
  },
};
