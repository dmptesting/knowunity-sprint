import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Summary } from './Summary';

const meta = {
  title: 'Screens/Summary',
  component: Summary,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Session complete: XP, number correct, and time.',
          '',
          'Three numbers, because the hint-for-XP trade has to be **visible to the student**, not only tracked internally (sprint-context.md). Someone who took two hints should be able to see what it cost.',
          '',
          '### `x/4`, never `x/5`',
          '',
          'The session is four questions, one per quiz in the section just completed. Figma 09 reads `4/5` — the count SPEC.md explicitly overrides, and one of the three drift fixes the design file is due.',
          '',
          '### The timer is real elapsed, paused',
          '',
          'Processing and hint-reading are paused out, so the number reflects time the student spent *explaining* rather than time they spent waiting for a mock judge or reading a hint. Otherwise the stat would mostly measure the prototype.',
          '',
          '### Differences from Figma screen 09',
          '',
          '- **`x/4`, not `4/5`.** See above.',
          '- **All three tiles are `accent/blue`.** 09 hand-draws them in blue, green and violet. `statTile` is a real component with no variants, tied to `accent/blue` — the build-screen skill lists 09\'s hand-drawn stats as a known wrong.',
          "- **Labels are sentence case.** 09 sets them uppercase: `XP` / `CORRECT` / `TIME`. `XP` stays as it is, being an abbreviation; the other two become \"Correct\" and \"Time\", matching `statTile`'s own summary-row story.",
        ].join('\n'),
      },
    },
  },
  args: {
    correct: 3,
    xp: 18,
    elapsedSeconds: 192,
    onContinue: fn(),
  },
} satisfies Meta<typeof Summary>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The session the script actually plays: Q1, Q2 and Q4 pass, Q3 rides the
 * ladder to reveal. Three of four, with XP reduced for the hint Q2 took.
 */
export const Default: Story = {
  name: 'Three of four',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('3/4')).toBeVisible();
    await expect(canvas.getByText('+18')).toBeVisible();
    await expect(canvas.getByText('3:12')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Back to study plan' }),
    );
    await expect(args.onContinue).toHaveBeenCalled();
  },
};

/** Everything unaided: full marks, full XP. */
export const AllFour: Story = {
  name: 'Four of four, unaided',
  args: { correct: 4, xp: 40, elapsedSeconds: 148 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('4/4')).toBeVisible();
    await expect(canvas.getByText('2:28')).toBeVisible();
  },
};

/**
 * None passed. The headline drops its congratulation rather than
 * congratulating someone who got nothing — but nothing is painted in
 * `feedback/error` either. The session still happened.
 */
export const NonePassed: Story = {
  name: 'None passed',
  args: { correct: 0, xp: 0, elapsedSeconds: 95 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('0/4')).toBeVisible();
    await expect(canvas.getByText("That's the section done.")).toBeVisible();
  },
};

/** Over ten minutes, to check the timer does not pad the minutes. */
export const LongSession: Story = {
  name: 'A long session',
  args: { correct: 2, xp: 12, elapsedSeconds: 754 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('12:34')).toBeVisible();
  },
};
