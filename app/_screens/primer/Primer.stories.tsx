import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Primer } from './Primer';

/*
 * Every story stubs `requestMicrophone`. Story tests run in headless Chromium
 * via Playwright, where the real `getUserMedia` either rejects outright or
 * hangs waiting on a prompt nobody can answer — so the seam exists precisely
 * so no test ever reaches the browser API.
 */
const grants = () => fn(async () => 'granted' as const)();
const refuses = () => fn(async () => 'denied' as const)();

const meta = {
  title: 'Screens/Primer',
  component: Primer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The first thing the student sees, and the screen that earns the permission prompt.',
          '',
          'The prompt fires from the tap on "let\'s get started" — **never on mount**. You get one per feature, and a request the student did not ask for is the one most likely to be refused (Voice UX Reference, principle 3, and its Babbel precedent).',
          '',
          '### What it explains',
          '',
          'SPEC.md §3: Knowie\'s line, then a `TextBlock` M saying what the mic is for and how the gesture works, then the tap-mode toggle (`CheckboxRow`). This is the only screen that explains the hold, so the alternative to it sits right beside the explanation — and the gesture caption switches to the tap wording as soon as the box is ticked, matching the voice turn\'s own hint line.',
          '',
          '### Two ways forward',
          '',
          '`ButtonGroup` Vertical: "Let\'s get started" fires the prompt; "I\'d rather type" never asks for the mic and starts the session in text. Nobody has to say yes to the mic to begin.',
          '',
          '### The message is not a bubble',
          '',
          "A bare text node at Greed/Headline S, as frame 02 draws it. That is the right call and not just frame fidelity: centred under a centred mascot, `calloutBubble`'s fixed left-pointing tail points at nothing — the open question `MascotSlot`'s own \"Above a calloutBubble\" story records.",
          '',
          '### The mic call is injectable',
          '',
          'The screen takes `requestMicrophone` as a prop. The default is the real `getUserMedia` call; every story passes a stub, and the running prototype passes a mock unless `?mic=real`.',
        ].join('\n'),
      },
    },
  },
  args: { onPermission: fn(), onTypeInstead: fn(), onTapModeChange: fn() },
} satisfies Meta<typeof Primer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The screen as the student meets it, with the mic not yet asked for. */
export const Default: Story = {
  args: { requestMicrophone: grants },
  play: async ({ canvas, args }) => {
    await expect(
      canvas.getByRole('button', { name: "Let's get started" }),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: "I'd rather type" })).toBeVisible();
    await expect(
      canvas.getByRole('checkbox', { name: 'Tap to start and stop instead of holding' }),
    ).not.toBeChecked();
    await expect(canvas.getByText(/let go to send/)).toBeVisible();
    // Nothing has asked for the microphone yet.
    await expect(args.onPermission).not.toHaveBeenCalled();
  },
};

/** The student allows it, and the session starts in voice. */
export const PermissionGranted: Story = {
  name: 'Tapping start, then allowing',
  args: { requestMicrophone: grants },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: "Let's get started" }));
    await expect(args.onPermission).toHaveBeenCalledWith('granted');
  },
};

/** The student refuses, and the session routes into text rather than stopping. */
export const PermissionRefused: Story = {
  name: 'Tapping start, then refusing',
  args: { requestMicrophone: refuses },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: "Let's get started" }));
    await expect(args.onPermission).toHaveBeenCalledWith('denied');
  },
};

/** The student opts out of voice before the prompt is ever shown. */
export const TypeInstead: Story = {
  name: "Choosing to type",
  args: { requestMicrophone: grants },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: "I'd rather type" }));
    await expect(args.onTypeInstead).toHaveBeenCalled();
    await expect(args.onPermission).not.toHaveBeenCalled();
  },
};

/** Ticking the toggle reports it; the session owns the value. */
export const TurningOnTapMode: Story = {
  name: 'Turning on tap mode',
  args: { requestMicrophone: grants },
  play: async ({ canvas, args }) => {
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Tap to start and stop instead of holding' }),
    );
    await expect(args.onTapModeChange).toHaveBeenCalledWith(true);
  },
};

/** Tap mode on: the gesture caption switches to the tap wording. */
export const TapModeOn: Story = {
  name: 'Tap mode on',
  args: { requestMicrophone: grants, tapMode: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('checkbox', { name: 'Tap to start and stop instead of holding' }),
    ).toBeChecked();
    await expect(canvas.getByText(/tap again to send/)).toBeVisible();
  },
};

/** A longer opening line, to check it wraps and stays centred under the mascot. */
export const LongLine: Story = {
  name: 'A longer line',
  args: {
    requestMicrophone: grants,
    knowieLine:
      "Nice work finishing Network Basics — that was the long one. Let's talk through what actually stuck before you move on.",
  },
};
