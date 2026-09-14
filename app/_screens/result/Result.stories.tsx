import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Result } from './Result';
import { RECALL_SCRIPT } from '../../_recall/script';

/* Question 3 is the one SPEC.md rides down the full ladder, so both misses
   come from its attempt list rather than being written twice. */
const Q3 = RECALL_SCRIPT[2];
const FAIL = Q3.attempts[0];
const PARTIAL = Q3.attempts[1];
/* Q1 is the pass the session opens on. */
const PASS = RECALL_SCRIPT[0].attempts[0];

const meta = {
  title: 'Screens/Result',
  component: Result,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'How the attempt was judged: the verdict, what we heard, the feedback, and the two ways forward.',
          '',
          '### Three states, one screen',
          '',
          '`partial` and `fail` are the two SPEC.md lists: same components, same layout, and **the distinction is copy only** — partial acknowledges what was right, fail stays encouraging without inventing credit.',
          '',
          '`pass` is here too, because a playable session needs it. It is painted in `feedback/success/subtle` — the one feedback token that can only feel good, and the only one used anywhere in the loop — Knowie is `giggling` at 3XL, and its action is Figma 06\'s single "Next question" rather than the miss pair, since a pass has nothing to try again and no hint to spend. **No checkmark:** 06 draws a green check-circle, dropped on the designer\'s instruction as one affirmation too many beside the mascot.',
          '',
          '### The transcript is quieter than the feedback',
          '',
          "Showing what was heard is a transparency aid, not the verdict. It was a `textBlock` at the same size as the feedback, which left two competing headlines and no way to tell at a glance what had happened — so it is now a bare region bound to real text styles: label at Caption M Bold / `text/tertiary`, the words at Body S Regular / `text/secondary`. `textBlock` has no step between M (18/12) and S (15/9), and S's caption is unreadable at 9px, so design-system.md's own escape applies: *\"a bare text node bound to a real text style if textBlock's title+caption shape doesn't fit the state\"*.",
          '',
          '**Neither miss gets a coloured panel.** No error or warning surface is ever painted behind a miss.',
          '',
          '### The transcript is not a `calloutBubble`',
          '',
          "`calloutBubble` is Knowie's speech bubble — a tail plus a bubble, its prop documented as \"the copy Knowie is 'saying'\". Putting the student's words in it would make Knowie say them, on the one screen whose whole job is showing what we heard *the student* say. It is a `textBlock`, labelled.",
          '',
          'It is also deliberately **not editable**. Showing what was heard is a transparency aid; making correction a required step would put back exactly the keyboard friction voice exists to remove.',
          '',
          '### Differences from Figma screen 07',
          '',
          'Screen 07 is the drawn partial state. This build departs from it in five places, four of them because SPEC.md says so:',
          '',
          "- **The header is the documented recall header.** 07 puts the progress bar on the left and a close button on the right, with no skip. SPEC.md and `AppBar.stories.tsx` both specify `leftAndRightButton`: close left, progress in the slot, skip right.",
          '- **There is a verdict header.** 07 draws none; SPEC.md lists `VerdictHeader` in this screen\'s components.',
          '- **There is a transcript.** 07 draws none; SPEC.md lists `TextBlock` ×2, "what was heard, then the feedback".',
          '- **The buttons are sentence case and size L.** 07 reads "Try Again" / "View Hint" at size M.',
          "- **The copy is centred by an override, not by the variant.** 07 centres both lines and so does this, but `textBlock`'s alignment is part of its variant — XL and L centre, M and S are left aligned — so `Result.module.css` sets `text-align: center` on the two blocks from the screen. That is a deliberate, disclosed override of a component contract, taken because the alternative left the centred verdict marker orphaned above a left-aligned column. Nothing else about the blocks is touched.",
          '',
          "07's own two lines are kept verbatim as the partial feedback.",
        ].join('\n'),
      },
    },
  },
  args: {
    progress: '50',
    onClose: fn(),
    onSkip: fn(),
    onTryAgain: fn(),
    onViewHint: fn(),
    onNext: fn(),
  },
} satisfies Meta<typeof Result>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The state this build was asked for. The transcript shows visible
 * speech-to-text mangling — "brew tea force it" — which is the whole point of
 * showing it: the miss reads as "it misheard me", not "I failed".
 */
export const Fail: Story = {
  args: {
    verdict: 'fail',
    transcript: FAIL.transcript,
    feedback: FAIL.feedback!,
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Not quite')).toBeVisible();
    await expect(canvas.getByText(args.transcript)).toBeVisible();
    await expect(canvas.getByText(args.feedback.headline)).toBeVisible();

    // Both ways forward.
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onTryAgain).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'View hint' }));
    await expect(args.onViewHint).toHaveBeenCalled();
  },
};

/**
 * The same screen, the other miss. The transcript here is coherent but
 * incomplete — the student got part of it — and the feedback is Figma screen
 * 07's copy verbatim.
 */
export const Partial: Story = {
  args: {
    verdict: 'partial',
    transcript: PARTIAL.transcript,
    feedback: PARTIAL.feedback!,
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Almost')).toBeVisible();
    await expect(canvas.getByText(args.feedback.detail)).toBeVisible();
  },
};

/**
 * Never trapped: the header's two escapes work from a miss too, which is the
 * check SPEC.md's verification step 4 asks for on every screen.
 */
export const HeaderEscapes: Story = {
  name: 'Both escapes are live',
  args: {
    verdict: 'fail',
    transcript: FAIL.transcript,
    feedback: FAIL.feedback!,
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(args.onClose).toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onSkip).toHaveBeenCalled();
  },
};

/**
 * A long, badly mangled transcript. This is the case 07's one-line copy never
 * tests: the block has to wrap and the column has to scroll under the scrim
 * rather than collide with the action pair.
 */
export const LongMangledTranscript: Story = {
  name: 'A long, mangled transcript',
  args: {
    verdict: 'fail',
    transcript:
      "um so i think the pass word has to have like symbols in it and numbers and maybe a capital letter at the start so that it's harder for someone to brew tea force it and get in to your account",
    feedback: FAIL.feedback!,
  },
};

/* --- the pass ----------------------------------------------------------- */

/**
 * A pass. The only state in the loop that gets a `feedback/success/subtle`
 * panel, and the only result state with a single action.
 */
export const Pass: Story = {
  args: {
    verdict: 'pass',
    transcript: PASS.transcript,
    feedback: PASS.feedback!,
    progress: '0',
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Correct')).toBeVisible();

    // One action, not the miss pair.
    await expect(
      canvas.queryByRole('button', { name: 'View hint' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Next question' }));
    await expect(args.onNext).toHaveBeenCalled();
  },
};
