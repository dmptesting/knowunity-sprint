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
          '### Deliberately bare',
          '',
          'Mascot, one line, one button — Figma 02 exactly.',
          '',
          'It previously carried a primer explanation ("4 questions, answered out loud…"), an "I\'d rather type" escape and a tap-mode toggle. All three were removed on the designer\'s instruction. The text path is still reachable from the turn itself and from a refused permission, so nobody is trapped by their absence — but note this is a **departure from SPEC.md**, which lists a `ButtonGroup` with `secondaryCTA="I\'d rather type"` here and makes this the one screen that explains the hold gesture.',
          '',
          'With the toggle gone, tap mode is reached only automatically — a click with no pointer behind it (`detail === 0`, which is what Enter, Space and a screen reader\'s activate gesture produce) always behaves as a tap on the voice turn.',
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
  args: { onPermission: fn() },
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

/** A longer opening line, to check it wraps and stays centred under the mascot. */
export const LongLine: Story = {
  name: 'A longer line',
  args: {
    requestMicrophone: grants,
    knowieLine:
      "Nice work finishing Network Foundations — that was the long one. Let's talk through what actually stuck before you move on.",
  },
};
