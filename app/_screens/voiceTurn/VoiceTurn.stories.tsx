import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent } from 'storybook/test';

import { VoiceTurn } from './VoiceTurn';
import { RECALL_SCRIPT } from '../../_recall/script';

const QUESTION = RECALL_SCRIPT[2].prompt;

const meta = {
  title: 'Screens/Voice turn',
  component: VoiceTurn,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The turn itself: idle, recording, armed-to-cancel, processing, and the four status notices.',
          '',
          '### Nothing detects when the student stops talking',
          '',
          'There is no timer, no silence threshold and no endpointing of any kind. Holding in silence for a minute submits **nothing** — the take ends when the student ends it. That is the brief\'s constraint and the Voice UX Reference\'s second principle: the commonest voice failure is the system guessing wrong about when someone is still talking, and push-to-talk removes the guess rather than tuning it.',
          '',
          '### Cancel arms in any direction',
          '',
          'Slide off the circle — any direction, measured from its centre — and the release discards instead of sending. A student who fumbles should not also have to remember which way to go.',
          '',
          'The only thing teaching it is the hint line, which is why it moves through three phrasings: **"Hold to speak" → "Release to send · slide away to cancel" → "Release to cancel"**.',
          '',
          '### Skip lives in the header',
          '',
          "`AppBar`'s `rightCTA`, matching the library's documented recall header — **not** under the circle, as the first draft had it. That leaves \"type instead\" as the only action down there, and only while idle: frames 04 and 05 drop it mid-take, and there is nothing to escape *to* while a take is running.",
          '',
          '### The accessible alternative',
          '',
          'Tap-to-start / tap-to-send. It is **automatic** for keyboard and assistive tech — a click with no pointer behind it (`detail === 0`) always behaves as a tap, whatever the toggle says, because nobody should have to hold a key down to be heard. The primer\'s toggle sets it manually for everyone else.',
          '',
          'Tap mode gets a visible **Cancel** button, since it has no slide gesture. Without it, turning the toggle on would cost the student the cancel that hold users get for free — that button is not in SPEC.md, and it is the one addition this screen makes.',
          '',
          '### Differences from frames 03 / 04 / 05',
          '',
          '- **The header is the documented recall header.** The frames put progress left and a close button right, with no skip.',
          '- **The circle is the real `voiceCircle`.** The frames instantiate a local `Voice circle (invented)` set — a known wrong.',
          '- **Knowie is 2XL (120px).** The frames resize the instance down to ~70px, which is an off-token override, not a variant.',
          '- **"Type instead" is a Tertiary `Button`, not a bare text node.** 03 floats it as loose text with no hit target; a 44px target is the floor.',
          '- **The idle hint reads "Hold to speak", not "Hold mic to speak".** SPEC.md\'s wording.',
          '- **The armed phase and all four notices are new.** No frame draws them.',
        ].join('\n'),
      },
    },
  },
  args: {
    question: QUESTION,
    progress: '50',
    onClose: fn(),
    onSkip: fn(),
    onTypeInstead: fn(),
    onSend: fn(),
    onCancel: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof VoiceTurn>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- the three phases of a take ---------------------------------------- */

/** Resting. The mic is one hold away, and both escapes are reachable. */
export const Idle: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Hold to speak')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Type instead' }));
    await expect(args.onTypeInstead).toHaveBeenCalled();
  },
};

/** Mid-take. Releasing here sends; sliding away arms the cancel. */
export const Holding: Story = {
  name: 'Holding — release to send',
  args: { phase: 'holding' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('Release to send · slide away to cancel'),
    ).toBeVisible();
  },
};

/** Slid off the circle. Releasing now discards the take instead of sending it. */
export const ArmedToCancel: Story = {
  name: 'Armed to cancel',
  args: { phase: 'armed' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Release to cancel')).toBeVisible();
  },
};

/** The answer is away and being judged — the under-4s wait. */
export const Processing: Story = {
  args: { processing: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Checking your answer…')).toBeVisible();
    await expect(canvas.getByRole('img', { name: 'Checking your answer' })).toBeVisible();
  },
};

/* --- the gesture, driven for real -------------------------------------- */

/**
 * The real thing, with pointer events: press, slide off the circle, release.
 * The take is **discarded, not sent**, and the hint line moves through all
 * three phrasings on the way. This is SPEC.md's verification step 7.
 */
export const SlideAwayCancels: Story = {
  name: 'Gesture — slide away discards the take',
  play: async ({ canvas, args }) => {
    const control = canvas.getByRole('button', {
      name: 'Hold to record your answer',
    });
    const box = control.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const pointer = { pointerId: 1, pointerType: 'touch', isPrimary: true };

    await fireEvent.pointerDown(control, { ...pointer, clientX: cx, clientY: cy });
    // findByText, not getByText: a raw fireEvent dispatch runs outside act(),
    // so the state update it triggers is not guaranteed to have flushed by
    // the very next line. findByText polls instead of checking once.
    await expect(await canvas.findByText('Release to send · slide away to cancel')).toBeVisible();

    // Well outside the circle, upward — any direction arms it.
    await fireEvent.pointerMove(control, {
      ...pointer,
      clientX: cx,
      clientY: cy - box.height,
    });
    await expect(await canvas.findByText('Release to cancel')).toBeVisible();

    await fireEvent.pointerUp(control, {
      ...pointer,
      clientX: cx,
      clientY: cy - box.height,
    });
    await expect(args.onCancel).toHaveBeenCalled();
    await expect(args.onSend).not.toHaveBeenCalled();
    // And it returns to rest, ready for another go.
    await expect(await canvas.findByText('Hold to speak')).toBeVisible();
  },
};

/**
 * The same gesture without the slide: press and release on the circle sends.
 * Nothing submits until the release — there is no endpointing anywhere.
 */
export const ReleaseSends: Story = {
  name: 'Gesture — release on the circle sends',
  play: async ({ canvas, args }) => {
    const control = canvas.getByRole('button', {
      name: 'Hold to record your answer',
    });
    const box = control.getBoundingClientRect();
    const at = {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
    };

    await fireEvent.pointerDown(control, at);
    // Still held, and staying held: nothing has been sent.
    await expect(await canvas.findByText('Release to send · slide away to cancel')).toBeVisible();
    await expect(args.onSend).not.toHaveBeenCalled();

    // A long, silent hold. No endpointing anywhere, so this submits nothing.
    await fireEvent.pointerMove(control, at);
    await expect(args.onSend).not.toHaveBeenCalled();

    await fireEvent.pointerUp(control, at);
    await expect(args.onSend).toHaveBeenCalled();
    await expect(args.onCancel).not.toHaveBeenCalled();
  },
};

/* --- the accessible alternative ---------------------------------------- */

/** Tap mode on: tap to start, tap to send, with a visible cancel. */
export const TapMode: Story = {
  name: 'Tap mode',
  args: { tapMode: true },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Tap to start')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Tap to start recording' }),
    );
    await expect(canvas.getByText('Tap to send')).toBeVisible();

    // The cancel hold users get from the slide gesture, made visible.
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalled();
    await expect(args.onSend).not.toHaveBeenCalled();
  },
};

/**
 * Keyboard, with the toggle **off**. Enter and Space produce a click with no
 * pointer behind it, so the control falls back to tap mode automatically —
 * nobody has to hold a key down to be heard.
 */
export const KeyboardFallsBackToTap: Story = {
  name: 'Keyboard — tap mode without the toggle',
  play: async ({ canvas, args }) => {
    const control = canvas.getByRole('button', {
      name: 'Hold to record your answer',
    });
    control.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Release to send · slide away to cancel')).toBeVisible();

    await userEvent.keyboard('{Enter}');
    await expect(args.onSend).toHaveBeenCalled();
  },
};

/* --- the four status notices ------------------------------------------- */

/** Nothing came through. Free — the hint ladder is not charged. */
export const NoticeEmpty: Story = {
  name: 'Notice — nothing heard',
  args: { notice: 'empty' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

/** Heard, but in pieces. Also free. */
export const NoticeGarbled: Story = {
  name: 'Notice — garbled',
  args: { notice: 'garbled' },
};

/** Past 4s. The copy softens; the processing state holds rather than erroring. */
export const NoticeTimeoutSoft: Story = {
  name: 'Notice — timeout at 4s',
  args: { notice: 'timeoutSoft', processing: true },
};

/** Past 8s. A retry is offered, but it still never errors out. */
export const NoticeTimeoutRetry: Story = {
  name: 'Notice — timeout at 8s',
  args: { notice: 'timeoutRetry', processing: true },
};

/** Offline. Progress and XP are kept; the in-flight attempt is discarded. */
export const NoticeNetwork: Story = {
  name: 'Notice — offline',
  args: { notice: 'network' },
};

/* --- skip --------------------------------------------------------------- */

/**
 * SPEC.md's screen 5. It has no state of its own — it is the header's
 * `rightCTA`, live from every question state.
 */
export const Skip: Story = {
  name: 'Skip, from the header',
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onSkip).toHaveBeenCalled();
  },
};

/* --- the spent hints ---------------------------------------------------- */

/**
 * One hint spent. It shows as a magenta "Hint 1" chip under Knowie's question,
 * aligned to the bubble's left edge — the hint itself is read in the overlay
 * the chip reopens, not on the turn.
 */
export const HintShown: Story = {
  name: 'Hint 1 chip',
  args: { hints: [RECALL_SCRIPT[2].hints[0]], onOpenHint: fn() },
  play: async ({ canvas, args }) => {
    const chip = canvas.getByRole('button', { name: /^Hint 1/ });
    await userEvent.click(chip);
    await expect(args.onOpenHint).toHaveBeenCalledWith(0);
    // Still recordable with a hint spent — that is the whole point.
    await expect(
      canvas.getByRole('button', { name: 'Hold to record your answer' }),
    ).toBeEnabled();
  },
};

/** Both hints spent: magenta then blue, both still reachable. */
export const SecondHintShown: Story = {
  name: 'Hint 1 and Hint 2 chips',
  args: { hints: [RECALL_SCRIPT[2].hints[0], RECALL_SCRIPT[2].hints[1]], onOpenHint: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Hint 2/ }));
    await expect(args.onOpenHint).toHaveBeenCalledWith(1);
    await expect(canvas.getByRole('button', { name: /^Hint 1/ })).toBeVisible();
  },
};

/* --- under a result sheet ----------------------------------------------- */

/**
 * `locked` — what the turn does while a result sheet is over its lower half.
 * The question body is inert, so the circle under the sheet can't start a
 * take; the header is not, so close and skip always work. A student who got it
 * wrong must never be funnelled into only "try again" or "view hint".
 */
export const LockedUnderSheet: Story = {
  name: 'Locked under a result sheet',
  args: { locked: true },
  play: async ({ canvas, canvasElement, args }) => {
    // Header: still live.
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onSkip).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(args.onClose).toHaveBeenCalled();

    // Body: inert, so the circle is out of reach of pointer and keyboard.
    const main = canvasElement.querySelector('main');
    await expect(main).toHaveAttribute('inert');
    await expect(canvasElement.querySelector('header')?.closest('[inert]')).toBeNull();
  },
};
