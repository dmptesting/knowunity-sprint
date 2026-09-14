import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { VoiceCircle } from './VoiceCircle';

/**
 * The component description below is voiceCircle's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/voiceCircle',
  component: VoiceCircle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          "The animated circle that represents the AI's listening state during a spoken recall answer.",
          '',
          '**USE:** anywhere the student can speak — `idle` before they start talking, `recording` while their voice is being captured, `processing` while the answer is being evaluated.',
          '',
          "**DON'T:** reuse it as a generic loading spinner. Its three modes are tied specifically to the voice-input lifecycle, not to loading states in general.",
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### Layout note',
          '',
          "The component box is `Illustration/2500` (200px) square, but the halo ring is `Illustration/4000` (320px) and **deliberately overflows it**, exactly as in Figma. So this element measures 200px while reading as 320px wide on screen — leave room for the overflow, and don't put it in an `overflow: hidden` container.",
          '',
          '### Departures from Figma',
          '',
          '- **Two opacity tokens were added.** The halo (0.12) and inner ring (0.25) use raw Figma node opacity, and `tokens.json` had no opacity family at all. `Opacity/12` and `Opacity/25` were added to the token source and regenerated, so both rings are now bound. These still need mirroring as Figma variables to keep the file and the code in sync.',
          '- **Every mode animates; Figma is static.** The component is called "the animated circle" but the file carries no motion spec. The waveform steps each bar between real `Icon/*` tokens, and the think dot breathes between full opacity and `Opacity/25`, so every frame lands on a token. Durations and delays are unbound — there are no motion tokens.',
          '- **`idle` breathes, to invite a press.** Both rings swell outward by `Space/200` a side and back on a 4s loop, the halo trailing the inner ring by 0.4s. As they swell the inner ring dims (`Opacity/25` → `Opacity/12`) while the halo brightens (`Opacity/12` → `Opacity/25`), so the light passes outward. It moves only the rings, never the core, and is several times slower than the waveform and think dot, so an idle circle never reads as one that is listening.',
          '- **The breath widens the overflow.** At its peak the halo reaches `Space/800 + Space/200` (40px) past the component box, 8px more than at rest.',
          '- All motion is disabled under `prefers-reduced-motion: reduce`. In idle the halo holds at `Opacity/25` instead, a static stand-in for the breath.',
          '',
          '### Why it animates at all',
          '',
          'Voice UX Reference, principle 1: the current state must be unmistakable, and "colour alone isn\'t enough: pair it with a shape, icon, or motion." Principle 6 asks the thinking state to be "a skeleton/animated state, not a dead spinner." Each mode already carries a distinct shape (mic / bars / dot); the motion is what makes `recording` and `processing` read as live rather than frozen. In `idle` the motion has a different job — inviting the press — so it is slower, sits on the rings, and never touches the core.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['idle', 'recording', 'processing'],
      description: 'Figma variant property `mode`. The set’s only property.',
    },
  },
  args: {
    mode: 'idle',
  },
} satisfies Meta<typeof VoiceCircle>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------
 * One story per variant in the Figma component set, named exactly as Figma
 * names it.
 * ---------------------------------------------------------------------- */

/** The student hasn't started speaking. Mic glyph; the rings breathe to invite a press. */
export const Idle: Story = {
  name: 'mode=idle',
  args: { mode: 'idle' },
  play: async ({ canvas }) => {
    const circle = canvas.getByRole('img', { name: 'Ready to record' });
    await expect(circle).toBeVisible();

    // Both rings breathe; the core stays still.
    const [halo, ring, core] = Array.from(circle.children) as HTMLElement[];
    await expect(getComputedStyle(ring).animationName).not.toBe('none');
    await expect(getComputedStyle(halo).animationName).not.toBe('none');
    await expect(getComputedStyle(core).animationName).toBe('none');
  },
};

/** Voice is actively being captured. Five-bar waveform. */
export const Recording: Story = {
  name: 'mode=recording',
  args: { mode: 'recording' },
  play: async ({ canvas }) => {
    const circle = canvas.getByRole('img', { name: 'Recording' });
    await expect(circle).toBeVisible();

    // The breath belongs to idle only: once recording, the rings are still.
    const [halo, ring] = Array.from(circle.children) as HTMLElement[];
    await expect(getComputedStyle(ring).animationName).toBe('none');
    await expect(getComputedStyle(halo).animationName).toBe('none');
  },
};

/** The answer is being evaluated. Single breathing think dot. */
export const Processing: Story = {
  name: 'mode=processing',
  args: { mode: 'processing' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('img', { name: 'Checking your answer' })
    ).toBeVisible();
  },
};

/**
 * The three modes side by side, in lifecycle order
 * (`idle → recording → processing`), to check they read as unmistakably
 * different from one another and not just as three similar circles.
 *
 * Laid out at the halo's full 320px rather than the component's 200px box, so
 * the rings don't overlap each other.
 */
export const AllModes: Story = {
  name: 'All modes',
  parameters: {
    // This story is a comparison grid, not a screen — it needs more than the
    // 390px prototype viewport to show three 320px circles stacked.
    viewport: { disable: true },
    docs: { story: { inline: true, height: '1120px' } },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--dimension-space-2400)',
        paddingBlock: 'var(--dimension-space-1600)',
      }}
    >
      <VoiceCircle mode="idle" />
      <VoiceCircle mode="recording" />
      <VoiceCircle mode="processing" />
    </div>
  ),
};
