import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { BottomSheet } from './BottomSheet';

/**
 * bottomSheet started as Figma component set `13594:14763`, then was reworked
 * in code to a mascot-led layout. The docs below say where the two now differ.
 */
const meta = {
  title: 'Components/bottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: {
    // Edge to edge at the 390px viewport, the way a sheet sits on a phone.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The sheet that rises after a quiz answer is checked: Knowie beside the verdict and a short summary of why. A correct answer gets one button, "Next question" — or "View results" on the session\'s last question. An incorrect one gets "Try again" above "View hint 1" or "View hint 2". An unsure one gets "Try again" above "Skip question". A reveal one gets a single "Reveal answer".',
          '',
          '**USE:** the voice-recall verdict — `correct` for a pass, `incorrect` for a partial or a fail; `unsure` when a voice recording came through too distorted to judge; `reveal` when both hints are spent and the student still missed, so the answer has to be shown.',
          '',
          "**DON'T:** paint anything red or warning-coloured on `incorrect` — SPEC.md forbids an error treatment behind a miss — and don't give partial and fail the same title.",
          '',
          '### Also worth knowing',
          '',
          "- **It carries the recall verdict, overriding Figma's DON'T.** The Figma description says not to use it for the voice-recall verdict, because recall is judged three ways. The sheet was chosen as the verdict design anyway (2026-09-15), and the full-page Result screen was removed. Two results cover three verdicts: partial and fail share `incorrect` and are told apart by the title (\"Almost…\" / \"Not quite…\"), which keeps sprint-context.md's three-way judgment in the copy.",
          '- **`title` and `summary` are required,** so the sheet can never ship placeholder copy. The summary explains *why*; it should not restate the verdict.',
          '- **Knowie is decorative** here — the title and summary carry every word. He is `excited` on a correct answer, `confused` on an incorrect one, `thinking` on an unsure one and `standby` on a reveal; `expression` overrides any of them. Only `standby` is verified in real use (design-system.md).',
          '- **`reveal` ends the hint ladder.** Hint 1, re-attempt, hint 2, re-attempt, then this (sprint-context.md). One button, "Reveal answer", because the only way on is forward — there is no third try and no skip. Knowie is on `standby` rather than wearing a reaction: SPEC.md says he never reacts at a student who struggled. SPEC.md\'s own reveal screen uses `thinking`, which is now the unsure sheet\'s face. Not in the Figma set.',
          '- **`unsure` is not a verdict.** The recording was too distorted to judge, which is not the student\'s fault: the neutral surface, a thinking Knowie, and "Skip question" beside "Try again" so they are never stuck re-recording. It is not in the Figma set.',
          '- **`unsure` overlaps SPEC.md\'s garbled status notice.** SPEC.md §7 handles garbled audio with `statusNotice` inside the voice turn ("didn\'t catch that" → retry, free). Pick one treatment per screen rather than showing both.',
          '',
          '### Departures from Figma',
          '',
          '- **The layout no longer matches the Figma component.** Code follows a later reference: mascotSlot (2XL) beside a Headline S title (`font/size/lg`) and a Body M Regular summary, and full-width buttons — one on correct and reveal, two stacked on incorrect and unsure. The Figma set still shows the earlier header — verdict mark, "Nice!" / "Incorrect", thumbs up/down — and a "Why?" button, none of which exist here.',
          '- **376px tall, not 176px.** Fixed at the `Sheet/Result` token. Content sits at the top, the button is pinned to the bottom.',
          '- **It never scrolls, and the title never shrinks.** The title is Headline S (`font/size/lg`, 21px) on every sheet. An earlier build stepped it down to 18px when copy ran long, which made two sheets side by side show different title sizes, so it was removed. Budget the summary at about six lines (roughly 130 characters) on a correct sheet, but only about three (roughly 65) on an incorrect or unsure one — its second button takes the room. A title that wraps costs a line. Leave slack, since browsers wrap slightly differently; copy that overflows is clipped and logs a warning in development.',
          '- **The title is `text/primary` in every result.**',
          '- **The result changes only the panel and Knowie.** A correct sheet has the green `feedback/success/subtle` panel and an excited Knowie; an incorrect one has the neutral surface and a confused Knowie; an unsure one, the neutral surface and a thinking Knowie; a reveal, the neutral surface and Knowie on standby. The buttons never change colour: the main action is always `interactive/primary` ("Next question", "Try again", "Reveal answer") and the second button always `interactive/secondary` ("View hint 1" / "View hint 2", "Skip question"). A button is an action, not a verdict, so it looks the same every time — and a miss has no red anywhere, as SPEC.md asks.',
          '- **Figma drew the main button green on correct and red on incorrect.** Both were replaced with `interactive/primary`.',
          '- **mascotSlot is 2XL (120px).** 3XL (200px) would leave the text column under 120px wide at the 390px viewport.',
          "- **The button's lip is a 10% dark overlay, not 15% black.** No token holds black at 15%; snapped to `interactive/pressOverlayInverse`.",
          '- **Button padding uses Space tokens.** Figma binds `Padding/lg` and `Padding/xl`, which tokens.json does not carry; `Space/400` and `Space/600` hold the same 16px and 24px.',
          '- **Added for operability:** a focus ring and pressed feedback on the button. Figma defines neither.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    result: {
      control: 'inline-radio',
      options: ['correct', 'incorrect', 'unsure', 'reveal'],
      description: 'Figma variant property `result`. `unsure` and `reveal` are code-only.',
    },
    title: { control: 'text', description: 'The verdict. Not a Figma property.' },
    summary: { control: 'text', description: 'Why, in a sentence or two. Not a Figma property.' },
    ctaLabel: { control: 'text', description: "The main button's label. Not a Figma property." },
    lastQuestion: {
      control: 'boolean',
      description: 'Correct only: the last question, so the button reads "View results". Not a Figma property.',
    },
    hint: {
      control: 'inline-radio',
      options: [1, 2],
      description: 'Incorrect only: which hint the second button opens — "View hint 1" or "View hint 2". Not a Figma property.',
    },
    hintLabel: { control: 'text', description: "Overrides the second button's label, incorrect only. Not a Figma property." },
    skipLabel: { control: 'text', description: "The second button's label, unsure only. Not a Figma property." },
  },
  args: {
    result: 'correct',
    title: 'You are right!',
    summary: "A router crosses networks; a switch never leaves the one it's on.",
    onContinue: fn(),
    onTryAgain: fn(),
    onViewHint: fn(),
    onSkip: fn(),
    onReveal: fn(),
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A colour token as the browser computes it, for comparing against a painted fill. */
function resolveColor(token: string) {
  const probe = document.createElement('span');
  probe.style.backgroundColor = `var(${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

/** result=correct — the reference layout. */
export const Correct: Story = {
  name: 'result=correct',
  play: async ({ canvas, canvasElement, args }) => {
    await expect(canvas.getByRole('region', { name: 'You are right!' })).toBeVisible();
    // Short copy keeps the full-size title, Headline S.
    await expect(getComputedStyle(canvas.getByRole('heading')).fontSize).toBe('21px');
    await expect(canvasElement.querySelector('img[src*="excited"]')).not.toBeNull();
    await expect(canvas.getByText(args.summary)).toBeVisible();
    const next = canvas.getByRole('button', { name: 'Next question' });
    await expect(getComputedStyle(next).backgroundColor).toBe(resolveColor('--color-interactive-primary'));
    await userEvent.click(next);
    await expect(args.onContinue).toHaveBeenCalledTimes(1);
  },
};

/**
 * result=correct on the session's last question. There is no next question, so
 * the button reads "View results" and leads to the summary's stat tiles.
 */
export const CorrectLastQuestion: Story = {
  name: 'result=correct, last question',
  args: {
    lastQuestion: true,
    title: 'You are right!',
    summary: "That's the last one. Let's see how the section went.",
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.queryByRole('button', { name: 'Next question' })).toBeNull();
    const results = canvas.getByRole('button', { name: 'View results' });
    await expect(getComputedStyle(results).backgroundColor).toBe(resolveColor('--color-interactive-primary'));
    await userEvent.click(results);
    await expect(args.onContinue).toHaveBeenCalledTimes(1);
  },
};

/**
 * result=incorrect — neutral panel, "Try again" (interactive/primary) above
 * "View hint 1" (interactive/secondary). Neither is red: a miss is the next step,
 * not a penalty. The
 * second button takes room from the summary, so keep it well within three lines.
 */
export const Incorrect: Story = {
  name: 'result=incorrect',
  args: {
    result: 'incorrect',
    title: 'Not quite',
    summary: 'A switch never leaves its own network.',
  },
  play: async ({ canvas, canvasElement, args }) => {
    await expect(canvas.getByRole('region', { name: 'Not quite' })).toBeVisible();
    await expect(canvasElement.querySelector('img[src*="confused"]')).not.toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Next question' })).toBeNull();

    const [tryAgain, viewHint] = canvas.getAllByRole('button');
    await expect(tryAgain).toHaveAccessibleName('Try again');
    await expect(viewHint).toHaveAccessibleName('View hint 1');
    await expect(getComputedStyle(tryAgain).backgroundColor).toBe(resolveColor('--color-interactive-primary'));
    await expect(getComputedStyle(viewHint).backgroundColor).toBe(resolveColor('--color-interactive-secondary'));

    await userEvent.click(tryAgain);
    await expect(args.onTryAgain).toHaveBeenCalledTimes(1);
    await userEvent.click(viewHint);
    await expect(args.onViewHint).toHaveBeenCalledTimes(1);
    await expect(args.onViewHint).toHaveBeenCalledWith(1);
    await expect(args.onContinue).not.toHaveBeenCalled();
  },
};

/**
 * result=incorrect after a second miss — the second button now opens hint 2.
 * Everything else matches the first incorrect sheet.
 */
export const IncorrectSecondHint: Story = {
  name: 'result=incorrect, hint 2',
  args: {
    result: 'incorrect',
    hint: 2,
    title: 'Still not quite',
    summary: 'Think about which device crosses between networks.',
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.queryByRole('button', { name: 'View hint 1' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'View hint 2' }));
    await expect(args.onViewHint).toHaveBeenCalledTimes(1);
    await expect(args.onViewHint).toHaveBeenCalledWith(2);
  },
};

/**
 * result=unsure — the recording came through distorted, so there is nothing to
 * judge. Knowie is thinking; "Try again" sits above "Skip question", so the
 * student is never stuck re-recording.
 */
export const Unsure: Story = {
  name: 'result=unsure',
  args: {
    result: 'unsure',
    title: 'Hmm, I missed that',
    summary: 'Your recording came through a bit fuzzy.',
  },
  play: async ({ canvas, canvasElement, args }) => {
    await expect(canvas.getByRole('region', { name: 'Hmm, I missed that' })).toBeVisible();
    await expect(canvasElement.querySelector('img[src*="thinking"]')).not.toBeNull();
    await expect(canvas.queryByRole('button', { name: /View hint/ })).toBeNull();

    const [tryAgain, skip] = canvas.getAllByRole('button');
    await expect(tryAgain).toHaveAccessibleName('Try again');
    await expect(skip).toHaveAccessibleName('Skip question');
    await expect(getComputedStyle(tryAgain).backgroundColor).toBe(resolveColor('--color-interactive-primary'));
    await expect(getComputedStyle(skip).backgroundColor).toBe(resolveColor('--color-interactive-secondary'));

    await userEvent.click(tryAgain);
    await expect(args.onTryAgain).toHaveBeenCalledTimes(1);
    await userEvent.click(skip);
    await expect(args.onSkip).toHaveBeenCalledTimes(1);
    await expect(args.onViewHint).not.toHaveBeenCalled();
  },
};

/**
 * result=reveal — both hints spent and the second re-attempt still missed. One
 * button, forward only. The subtitle is the reveal screen's own line
 * (`REVEAL_LINE` in app/_recall/script.ts), so the sheet and the screen it
 * opens say the same thing.
 */
export const Reveal: Story = {
  name: 'result=reveal',
  args: {
    result: 'reveal',
    title: "Let's look at the answer",
    summary: "No shame in this one. Here's the answer, so you've got it for next time.",
  },
  play: async ({ canvas, canvasElement, args }) => {
    await expect(canvas.getByRole('region', { name: "Let's look at the answer" })).toBeVisible();
    await expect(canvasElement.querySelector('img[src*="standby"]')).not.toBeNull();

    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(1);
    await expect(buttons[0]).toHaveAccessibleName('Reveal answer');
    await expect(getComputedStyle(buttons[0]).backgroundColor).toBe(resolveColor('--color-interactive-primary'));

    await userEvent.click(buttons[0]);
    await expect(args.onReveal).toHaveBeenCalledTimes(1);
    await expect(args.onContinue).not.toHaveBeenCalled();
    await expect(args.onTryAgain).not.toHaveBeenCalled();
  },
};

/**
 * The title is the same size on every result, whatever the copy — including a
 * title long enough to wrap.
 */
export const TitleSize: Story = {
  name: 'The title is one size on every sheet',
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--dimension-space-400)' }}>
      <BottomSheet {...args} />
      <BottomSheet
        {...args}
        result="incorrect"
        title="Not quite"
        summary="A switch never leaves its own network."
      />
      <BottomSheet
        {...args}
        result="unsure"
        title="Hmm, I missed that"
        summary="Your recording came through a bit fuzzy."
      />
      <BottomSheet
        {...args}
        result="reveal"
        title="Let's look at the answer"
        summary="No shame in this one. Here's the answer, so you've got it for next time."
      />
      <BottomSheet
        {...args}
        title="You got every single part right!"
        summary="A router links separate networks; a switch never leaves its own."
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const sizes = canvas.getAllByRole('heading').map((h) => getComputedStyle(h).fontSize);
    await expect(new Set(sizes).size).toBe(1);
    await expect(sizes[0]).toBe('21px');

    for (const sheet of canvas.getAllByRole('region')) {
      const content = sheet.children[1] as HTMLElement;
      await expect(content.scrollHeight).toBeLessThanOrEqual(content.clientHeight);
    }
  },
};

/** The sheet is fixed at Sheet/Result, whatever its content. */
export const Height: Story = {
  name: 'Fixed at Sheet/Result (376px)',
  play: async ({ canvas }) => {
    const sheet = canvas.getByRole('region');
    await expect(sheet.getBoundingClientRect().height).toBe(376);
  },
};
