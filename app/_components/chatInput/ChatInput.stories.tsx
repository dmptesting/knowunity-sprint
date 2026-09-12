import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { ChatInput } from './ChatInput';

/**
 * Figma's Chat Input set carries no `.description` field, so there is nothing
 * to quote. What follows is what the set actually contains, where the sprint
 * uses it, and the places this build knowingly departs from the file.
 */
const meta = {
  title: 'Components/chatInput',
  component: ChatInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The chat input bar: six `Status` variants covering one text turn — `Inactive`, `Typing`, `Ready to send`, `Recording`, `Loading` and `Long input`.',
          '',
          '**USE:** the recall loop\'s **text fallback**. The Voice UX Reference lists it as a Must and frames it as accessibility, not a nice-to-have: some students can\'t speak at all, many more can\'t speak right now. Voice stays primary, text stays one tap away.',
          '',
          "**DON'T:** don't let it become the required path — and don't use `Recording` to detect when the student stops talking. Sending is always an explicit press.",
          '',
          '_**No quoted description:** this set has no `.description` in Figma, and design-system.md never lists it. That makes it the least-verified component in this build — nothing says where it has been proven._',
          '',
          '### Also worth knowing',
          '',
          '- **`Recording` is push-to-talk.** The waveform runs while the student holds the mic; the send button is the explicit send. No auto-endpointing anywhere.',
          "- **The leading button changes meaning in `Recording`:** attach becomes cancel, which covers the sprint's \"cancel and re-record before send\" Must state.",
          '- **`label` is required.** The design has no visible label, and a placeholder is not an accessible name.',
          '',
          '### Departures from Figma',
          '',
          "- **The icon buttons are `buttonIcon`, not Figma's \"OLD Icon Button\".** That nested component is named OLD and predates the current icon-only component, so this composes the real one. Visible effect: the leading button's fill is `background/surface` rather than `interactive/secondary`, and the send button is 44px rather than 40px — the size that fits the field exactly.",
          '- **Text is `Greed/Body S Bold`.** Figma\'s placeholder is Inter SemiBold 14 with no text style attached — the only text in the set off the Greed scale. Snapped to the nearest real style at the same weight.',
          '- **The mic and send glyphs are recoloured.** Figma binds the mic to `background/inverse` and the send glyph to `interactive/secondary` — the latter is a 10%-white fill on a near-white button, which would be invisible. They inherit `text/primary` and the button\'s own on-fill ink instead.',
          '- **The mic is a real button.** Figma draws a bare icon. It keeps Figma\'s `Icon/300` box as its painted size, but a transparent `::after` widens the tappable area to `Target/Minimum` (44px), so the drawing matches the file while the target clears the touch floor.',
          '- **The placeholder is `text/secondary`, not `text/disabled`.** Figma uses `text/disabled`, which measures 3.79:1 on `background/input` — under the 4.5:1 WCAG minimum. A placeholder is ordinary text and is not exempt the way a disabled control is, so it steps up to `text/secondary` (7.72:1).',
          '- **The field is 44px tall, not 38px.** Raised to `Target/Minimum` so the pill itself is a reliable tap target, and the input stretches to fill it rather than taking taps only on its 20px line box.',
          '- **The waveform is 33 bars stepping between `Icon/*` tokens, and it animates.** Figma\'s bars are a flattened group whose real heights are not recoverable, and the file specifies no motion. Recording "must be unmistakable", so it moves; all motion respects `prefers-reduced-motion`.',
          '- **`Radius/Full` replaces the leading button\'s "Scale 06" radius,** a variable that was never exported to `tokens.json`. At 56px the two render the same circle.',
          '- **A focus ring and live announcements were added.** Figma defines no focus state, and `Recording` and `Loading` are otherwise conveyed by a waveform and a spinner alone.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ paddingBlock: 'var(--dimension-space-600)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    status: {
      control: 'select',
      options: ['Inactive', 'Typing', 'Ready to send', 'Recording', 'Loading', 'Long input'],
      description: 'Figma variant property `Status`.',
    },
    value: { control: 'text', description: 'What the student has typed.' },
    placeholder: { control: 'text', description: 'Placeholder copy.' },
    label: { control: 'text', description: 'The field\'s accessible name. Not a Figma property.' },
  },
  args: {
    status: 'Inactive',
    placeholder: 'Type your answer',
    label: 'Type your answer',
    onAdd: fn(),
    onCancel: fn(),
    onVoice: fn(),
    onSend: fn(),
  },
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------
 * One story per variant in the Figma component set, named exactly as Figma
 * names it. Copy is the sprint's text fallback, not Figma's "Ask anything...".
 * ---------------------------------------------------------------------- */

/** Nothing typed yet. The mic is one tap away, which is the point. */
export const Inactive: Story = {
  name: 'Status=Inactive',
  args: { status: 'Inactive' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('textbox', { name: 'Type your answer' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Switch to speaking' }));
    await expect(args.onVoice).toHaveBeenCalledTimes(1);
  },
};

/** The field has focus and a caret, but no text yet. */
export const Typing: Story = {
  name: 'Status=Typing',
  args: { status: 'Typing' },
};

/** Something typed, so the mic gives way to an explicit send. */
export const ReadyToSend: Story = {
  name: 'Status=Ready to send',
  args: {
    status: 'Ready to send',
    value: 'A longer password multiplies the guesses needed',
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.queryByRole('button', { name: 'Switch to speaking' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(args.onSend).toHaveBeenCalledTimes(1);
  },
};

/**
 * Push-to-talk, mid-take. The leading button cancels the recording rather than
 * attaching anything, and sending stays an explicit press — nothing here
 * decides on its own that the student has finished.
 */
export const Recording: Story = {
  name: 'Status=Recording',
  args: { status: 'Recording' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent(/recording/i);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel recording' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};

/** The answer is away and being judged — the <4s wait the reference insists on. */
export const Loading: Story = {
  name: 'Status=Loading',
  args: { status: 'Loading' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Checking your answer');
  },
};

/** A long typed answer. The field wraps and squares off; the bar grows upward. */
export const LongInput: Story = {
  name: 'Status=Long input',
  args: {
    status: 'Long input',
    value:
      'A password resists brute force because every extra character multiplies the number of combinations an attacker has to try, so length matters more than swapping letters for symbols.',
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('textbox', { name: 'Type your answer' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(args.onSend).toHaveBeenCalledTimes(1);
  },
};

/**
 * The reason this component is in the sprint at all: the student can't speak
 * right now, so the same turn happens in text. Typing is a real path through
 * the recall loop, not a dead end.
 */
export const TextFallback: Story = {
  name: 'Real usage — the text fallback turn',
  args: {
    status: 'Ready to send',
    value: 'Length beats complexity',
    label: 'Type your answer instead',
    placeholder: 'Type your answer instead',
  },
};
