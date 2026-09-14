import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { TextTurn } from './TextTurn';
import { RECALL_SCRIPT } from '../../_recall/script';

const Q3 = RECALL_SCRIPT[2];

const meta = {
  title: 'Screens/Text turn',
  component: TextTurn,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The same turn, typed. Same question, same header, same skip — only the answer arrives by keyboard.',
          '',
          '**Not a lesser path.** A typed answer gets the same verdicts, the same hint ladder and the same XP as a spoken one. Some students cannot speak; many more cannot speak *right now* — on a bus, in a library, in a shared room. A voice-only feature drops all of them from both activation and completion.',
          '',
          '### Text is sticky',
          '',
          'Once the session switches, it stays switched, so nobody has to re-choose it every question. `chatInput`\'s own mic button is the way back.',
          '',
          '### Send is always explicit',
          '',
          '`chatInput` has no submit-on-blur and no timer. The student presses send, exactly as they release the circle on the voice turn.',
          '',
          '### The four statuses',
          '',
          '`Inactive`, `Typing`, `Ready to send`, `Loading` — the ones SPEC.md lists. `Recording` and `Long input` exist on the component but belong to other screens.',
          '',
          '### Decisions, since there is no frame for this one',
          '',
          "- **It borrows the voice turn's geometry** — same header, same Knowie row at `Space/400` insets — so switching modes mid-session does not feel like landing somewhere else.",
          '- **The mic is `chatInput`\'s, not a second control.** SPEC.md asks for a "persistent mic control"; the component shows the mic only while there is nothing to send, giving way to the send button once something is typed. Adding a second mic would duplicate it, so this follows the component. The mic returns the moment the field is empty — worth a look if "persistent" was meant literally.',
          '- **Status notices appear here too.** Timeout and network can land on a typed answer just as easily as a spoken one.',
        ].join('\n'),
      },
    },
  },
  args: {
    question: Q3.prompt,
    progress: '50',
    onChange: fn(),
    onSend: fn(),
    onVoice: fn(),
    onRetry: fn(),
    onClose: fn(),
    onSkip: fn(),
  },
} satisfies Meta<typeof TextTurn>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing typed yet. The mic is one tap away — the way back to voice. */
export const Inactive: Story = {
  args: { status: 'Inactive' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByLabelText('Type your answer')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeVisible();

    // Text is reversible: the mic returns the student to voice.
    await userEvent.click(
      canvas.getByRole('button', { name: 'Switch to speaking' }),
    );
    await expect(args.onVoice).toHaveBeenCalled();
  },
};

/** The field has focus and a caret, but nothing typed. */
export const Typing: Story = {
  args: { status: 'Typing' },
};

/** Something typed, so the mic gives way to an explicit send. */
export const ReadyToSend: Story = {
  name: 'Ready to send',
  args: {
    status: 'Ready to send',
    value: 'A longer password multiplies the guesses needed',
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(args.onSend).toHaveBeenCalled();
  },
};

/** The answer is away and being judged — the same under-4s wait voice gets. */
export const Loading: Story = {
  args: {
    status: 'Loading',
    value: 'A longer password multiplies the guesses needed',
  },
};

/** Offline, on the text path. Progress and XP are kept either way. */
export const NoticeNetwork: Story = {
  name: 'Notice — offline',
  args: { status: 'Inactive', notice: 'network' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

/** Skip works from the text path too — never trapped, whichever mode you're in. */
export const Skip: Story = {
  name: 'Skip, from the header',
  args: { status: 'Inactive' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onSkip).toHaveBeenCalled();
  },
};

/**
 * A spent hint on the text path, as a chip. Same rule as voice: the hint is one
 * tap away under Knowie's question rather than a card on the screen.
 */
export const HintShown: Story = {
  name: 'Hint 1 chip',
  args: { status: 'Inactive', hints: [Q3.hints[0]], onOpenHint: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Hint 1/ }));
    await expect(args.onOpenHint).toHaveBeenCalledWith(0);
    await expect(canvas.getByLabelText('Type your answer')).toBeVisible();
  },
};
