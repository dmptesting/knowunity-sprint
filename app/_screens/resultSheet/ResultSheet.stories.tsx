import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { ResultSheet, type ResultSheetProps } from './ResultSheet';
import { VoiceTurn } from '../voiceTurn/VoiceTurn';
import { MISS_TITLE, RECALL_SCRIPT, REVEAL_LINE } from '../../_recall/script';
import { NOTICES } from '../../_recall/notices';

const Q1 = RECALL_SCRIPT[0];
const Q2 = RECALL_SCRIPT[1];
const Q3 = RECALL_SCRIPT[2];

/**
 * The turn behind each sheet: which question, how far through the session, and
 * whether the header still offers skip. Chosen here, in the one decorator every
 * story shares — a story that added a decorator of its own would stack a second
 * turn on top of this one, not replace it.
 */
const TURN_BEHIND: Record<
  NonNullable<ResultSheetProps['result']>,
  { question: string; progress: '25' | '50' | '75'; canSkip: boolean }
> = {
  correct: { question: Q1.prompt, progress: '75', canSkip: false },
  incorrect: { question: Q3.prompt, progress: '50', canSkip: true },
  unsure: { question: Q2.prompt, progress: '25', canSkip: false },
  reveal: { question: Q3.prompt, progress: '75', canSkip: false },
};

const meta = {
  title: 'Screens/Result sheet',
  component: ResultSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Every sheet that rises over the turn, with the turn left where it is — Knowie, the question, the circle — so the sheet is read against the question it is about.',
          '',
          '| Result | When | Actions |',
          '|---|---|---|',
          '| `correct` | A pass | Next question, or Finish on the last question |',
          '| `incorrect` | A miss, with a hint still to spend | Try again · View hint 1 or 2 |',
          '| `unsure` | Nothing usable came through (empty or garbled) | Try again · Skip question |',
          '| `reveal` | A miss with both hints spent | Reveal answer |',
          '',
          '### What this adds around `bottomSheet`',
          '',
          "Its props are exactly `bottomSheet`'s, passed straight through. `bottomSheet` paints the panel only — a `Sheet/Result` (376px) section with no position, scrim or motion. This composition supplies the anchor to the foot of the phone, the slide up, the dialog role and moving focus into the sheet. In the session the question body behind is locked while it is up; the header stays live.",
          '',
          '**No scrim**, so the question stays readable. **Reduced motion** drops the slide and the sheet simply appears.',
          '',
          '### Copy and expression, as the session sets them',
          '',
          '- **Correct:** the feedback headline and detail, Knowie `giggling`.',
          '- **Incorrect:** partial and fail share this sheet and are told apart by the title — "So close…" on a partial, "Not quite" on a fail (`MISS_TITLE` in `script.ts`) — with the feedback detail as the summary. Knowie wears the component\'s default, `confused`.',
          '- **Unsure:** "Hmm, I missed that", with the empty or garbled notice\'s line as the summary. This replaces the status notice for those two; timeouts and network failures keep theirs. The header\'s skip is hidden, since the sheet carries its own.',
          '- **Reveal:** "Let\'s look at the answer", with the reveal line. "Reveal answer" opens the answer page. The header\'s skip is hidden — the question is over.',
          '',
          '### What was lost',
          '',
          '**"What we heard" — the transcript — is no longer shown.** The Voice UX Reference\'s fourth principle leans on it so a miss reads as "it misheard me" rather than "I failed". `bottomSheet` has nowhere to put it. Logged as open in SPEC.md.',
          '',
          '### Why a sheet and not a screen',
          '',
          'This is the verdict design (decided 2026-09-15). The full-page Result screen it replaced was removed. Figma\'s `bottomSheet` description still says not to use it for the recall verdict; code overrides that on purpose — see design-system.md.',
        ].join('\n'),
      },
    },
  },
  args: {
    result: 'correct',
    title: Q1.attempts[0].feedback!.headline,
    summary: Q1.attempts[0].feedback!.detail,
    expression: 'giggling',
    onContinue: fn(),
    onTryAgain: fn(),
    onViewHint: fn(),
    onSkip: fn(),
    onReveal: fn(),
  },
  decorators: [
    (Story, ctx) => {
      const turn = TURN_BEHIND[ctx.args.result ?? 'correct'];
      return (
        <div style={{ position: 'relative', height: '100%' }}>
          {/* The turn behind the sheet, with its body locked as in the session. */}
          <div style={{ height: '100%' }}>
            <VoiceTurn
              question={turn.question}
              progress={turn.progress}
              locked
              canSkip={turn.canSkip}
            />
          </div>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof ResultSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A pass: green panel, Knowie giggling, one action on. */
export const Correct: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('dialog')).toBeVisible();
    // The question behind the sheet is still on screen.
    await expect(canvas.getByText(Q1.prompt)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Next question' }));
    await expect(args.onContinue).toHaveBeenCalled();
  },
};

/**
 * A pass on the session's last question: no next question to move to, so the
 * button reads "Finish" and leads to the summary's stat tiles instead.
 */
export const CorrectLastQuestion: Story = {
  name: 'Correct, last question',
  args: {
    lastQuestion: true,
  },
  play: async ({ canvas, args }) => {
    await expect(
      canvas.queryByRole('button', { name: 'Next question' }),
    ).not.toBeInTheDocument();
    const results = canvas.getByRole('button', { name: 'Finish' });
    await expect(results).toBeVisible();
    await userEvent.click(results);
    await expect(args.onContinue).toHaveBeenCalled();
  },
};

/** The first miss, a fail: "Not quite", and the first hint on offer. */
export const Incorrect: Story = {
  name: 'Incorrect, fail',
  args: {
    result: 'incorrect',
    title: MISS_TITLE.fail,
    summary: Q3.attempts[0].feedback!.detail,
    expression: undefined,
    hint: 1,
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Not quite')).toBeVisible();
    // Skip stays in the header on a miss.
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onTryAgain).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'View hint 1' }));
    await expect(args.onViewHint).toHaveBeenCalledWith(1);
  },
};

/**
 * The second miss, a partial: the same sheet, told apart from a fail by its
 * title — "So close…" — and now the second hint.
 */
export const IncorrectSecondHint: Story = {
  name: 'Incorrect, partial, second hint',
  args: {
    result: 'incorrect',
    title: MISS_TITLE.partial,
    summary: Q3.attempts[1].feedback!.detail,
    expression: undefined,
    hint: 2,
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('So close…')).toBeVisible();
    // A partial must never open on a fail's words.
    await expect(canvas.queryByText('Not quite')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'View hint 2' }));
    await expect(args.onViewHint).toHaveBeenCalledWith(2);
  },
};

/** Nothing came through. A free retry, or skip the question from the sheet itself. */
export const Unsure: Story = {
  args: {
    result: 'unsure',
    title: 'Hmm, I missed that',
    summary: NOTICES.empty.body,
    expression: undefined,
  },
  play: async ({ canvas, args }) => {
    // One turn behind the sheet, not two: a single header landmark.
    await expect(canvas.getAllByRole('banner')).toHaveLength(1);
    await expect(canvas.getByText(Q2.prompt)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onTryAgain).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Skip question' }));
    await expect(args.onSkip).toHaveBeenCalled();
  },
};

/** Both hints spent and still a miss. One way on: to the answer. */
export const Reveal: Story = {
  args: {
    result: 'reveal',
    title: "Let's look at the answer",
    summary: REVEAL_LINE,
    expression: undefined,
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reveal answer' }));
    await expect(args.onReveal).toHaveBeenCalled();
  },
};
