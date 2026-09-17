import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Summary } from './Summary';
import { SUMMARY_FALLBACK_LINE, pickRecallLine } from '../../_recall/script';

/** What the scripted session plays: Q1 and Q4 unaided, Q2 after one hint, Q3 revealed. */
const SCRIPTED_RECALL = pickRecallLine([0, 1, undefined, 0]);

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
          'Session complete: XP, number correct, and time — then Knowie, playing back the best part of one explanation the student gave.',
          '',
          '### Knowie remembers',
          '',
          'Below the stats, Knowie (`mascotSlot` 3XL, centred) sits above a tailless `calloutBubble` (`showTail={false}`), with the lower quarter of his body tucked behind it, recalling one passed answer in the student\'s own terms, to show he was really listening. The session picks it with `pickRecallLine`: of the passed questions, the one that took the fewest hints, and on a tie the earliest. Each question carries its own `recall` line in script.ts, written against its passing transcript.',
          '',
          'With nothing passed — all skipped, missed or revealed — the bubble shows a canned line that praises nothing, and Knowie is on `standby` instead of `excited`: SPEC.md keeps him from wearing a reaction at a student who struggled.',
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
          '- **Each tile has its own accent and icon** (`statTile`\'s `stat`: coral XP, green correct, blue time). 09 hand-draws them; the build-screen skill lists that as a known wrong.',
          '- **Knowie and the recall bubble are new.** 09 has neither; the stats, headline and eyebrow move to the top of the screen to make room, rather than sitting centred.',
          '- **The bubble has no tail.** It sits under Knowie rather than beside him, where the fixed left-pointing tail would point at nothing.',
          "- **Labels are sentence case.** 09 sets them uppercase: `XP` / `CORRECT` / `TIME`. `XP` stays as it is, being an abbreviation; the other two become \"Correct\" and \"Time\", matching `statTile`'s own summary-row story.",
        ].join('\n'),
      },
    },
  },
  args: {
    correct: 3,
    xp: 18,
    elapsedSeconds: 192,
    recallLine: SCRIPTED_RECALL,
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
  play: async ({ canvas, canvasElement, args }) => {
    await expect(canvas.getByText('3/4')).toBeVisible();
    await expect(canvas.getByText('+18')).toBeVisible();
    await expect(canvas.getByText('3:12')).toBeVisible();

    // Knowie recalls the earliest unaided pass — Q1, the router answer.
    await expect(canvas.getByText(/a router sends traffic between networks/)).toBeVisible();
    await expect(canvasElement.querySelector('img[src*="excited"]')).not.toBeNull();

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
  args: {
    correct: 0,
    xp: 0,
    elapsedSeconds: 95,
    recallLine: pickRecallLine([undefined, undefined, undefined, undefined]),
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('0/4')).toBeVisible();
    // Nothing to recall: the canned line, and Knowie on standby.
    await expect(canvas.getByText(SUMMARY_FALLBACK_LINE)).toBeVisible();
    await expect(canvasElement.querySelector('img[src*="standby"]')).not.toBeNull();
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
