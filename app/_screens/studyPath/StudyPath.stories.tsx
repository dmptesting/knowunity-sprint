import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { StudyPath } from './StudyPath';

const meta = {
  title: 'Screens/Study path',
  component: StudyPath,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Figma screen 01 — the study plan path, and the screen the recall step is launched from and returned to.',
          '',
          'It already ships in the beta, so this is a reproduction, not new design. SPEC.md covers *"the 10 states **missing** from the current build"* and the frame is named `01 — Study plan path (existing screen)`, so it was out of scope — but the prototype had no entry and no exit as a result, and SPEC.md\'s own out-of-scope note says the entry is **"node tap only"**. The node lives here.',
          '',
          '### Only the recall node does anything',
          '',
          'The tabs, the three quizzes and the next section are scenery. This prototype\'s scope is the recall step, and rendering the tabs as buttons would promise a Materials view that does not exist.',
          '',
          '### It is where the path-node rule finally shows',
          '',
          "SPEC.md's third *Also changing* item — *\"`PathNode` becomes `progress=\"completed\"` only if at least one question passed\"* — had nowhere to display before this screen existed. Play a session, pass at least one question, and the node comes back completed. Miss all four and it does not.",
          '',
          '### Differences from Figma screen 01',
          '',
          '- **The nodes are `pathNode` instances.** 01 hand-draws them as ellipses and a `checkbox` instance — the same class of drift as 09\'s hand-drawn stat tiles.',
          '- **"THIS FLOW STARTS HERE" is not built.** It is a designer\'s annotation to the reader of the Figma file, not product UI.',
          '- **Every quiz in the section is completed**, so the recall node is the one step left.',
          '- **The next section is built out.** 01 shows only its title. Here the title is centred between two rules, and four steps follow in the same pattern as the section above — three quizzes and an explain-out-loud, all `upcoming`. Their titles are invented.',
          '- **Labels are sentence case.** 01 sets the lesson titles in Title Case; `pathNode`\'s own stories already use sentence case, and CLAUDE.md requires it. `AP Cybersecurity Exam` stays as it is — it names a specific exam.',
          '- **The tabs are two spans, not one text node.** 01 draws `Plan          Materials` as a single string padded with spaces.',
        ].join('\n'),
      },
    },
  },
  args: { onExplain: fn() },
} satisfies Meta<typeof StudyPath>;

export default meta;
type Story = StoryObj<typeof meta>;

/*
 * pathNode spells its format and progress into the accessible name for screen
 * readers — "Explain out loud , explain out loud, current step" — so these
 * queries match on a pattern rather than the visible label alone. That suffix
 * is what makes the progress assertions below meaningful.
 *
 * (The space before the first comma is pathNode's, not a typo here: the
 * accessible name joins its label span and its visually-hidden span with one.)
 */
const recallNode = /^Explain out loud\b/;
// The next section has an explain-out-loud step of its own, so two match —
// this section's is the first.

/** Every quiz done, the recall node current and waiting, the next section to come. */
export const Default: Story = {
  name: 'Recall not yet done',
  play: async ({ canvas, args }) => {
    // Everything in the section but the recall node is done.
    for (const label of ['Network devices', 'Protocol layers', 'Network weaknesses']) {
      await expect(
        canvas.getByRole('button', { name: new RegExp(`^${label}\\b`) }),
      ).toHaveAccessibleName(/completed/);
    }

    // The next section: its title, then four steps not yet started.
    await expect(
      canvas.getByRole('heading', { name: 'Disruption and interception' }),
    ).toBeVisible();
    for (const label of ['Packet sniffing', 'Denial of service', 'Session hijacking']) {
      await expect(
        canvas.getByRole('button', { name: new RegExp(`^${label}\\b`) }),
      ).toHaveAccessibleName(/upcoming/);
    }
    const recallNodes = canvas.getAllByRole('button', { name: recallNode });
    await expect(recallNodes).toHaveLength(2);
    await expect(recallNodes[1]).toHaveAccessibleName(/upcoming/);

    const node = canvas.getAllByRole('button', { name: recallNode })[0];
    await expect(node).toHaveAccessibleName(/current step/);

    await userEvent.click(node);
    await expect(args.onExplain).toHaveBeenCalled();
  },
};

/**
 * After a session that passed at least one question. This is the only place
 * SPEC.md's path-node rule is visible.
 */
export const RecallCompleted: Story = {
  name: 'Recall completed',
  args: {
    quizProgress: ['completed', 'completed', 'completed'],
    explainProgress: 'completed',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getAllByRole('button', { name: recallNode })[0],
    ).toHaveAccessibleName(/completed/);
  },
};

/**
 * After a session that passed nothing. The node stays `current` — sitting
 * through four misses is not a completed node.
 */
export const RecallAttemptedButNonePassed: Story = {
  name: 'Recall attempted, none passed',
  args: {
    quizProgress: ['completed', 'completed', 'completed'],
    explainProgress: 'current',
  },
  play: async ({ canvas }) => {
    // Still offered, not marked done.
    await expect(
      canvas.getAllByRole('button', { name: recallNode })[0],
    ).toHaveAccessibleName(/current step/);
  },
};
