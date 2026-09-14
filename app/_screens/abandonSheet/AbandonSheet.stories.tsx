import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { AbandonSheet } from './AbandonSheet';
import { ABANDON_REASONS } from '../../_recall/abandonReasons';

const meta = {
  title: 'Screens/Abandon sheet',
  component: AbandonSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Shown when the student closes mid-session. Already shipped in the beta, so cutting it for a prototype would be a regression rather than a scope cut (sprint-context.md) — a plain confirm dialog would lose the eight reasons that are the whole point.',
          '',
          '### The primary adapts; the escape never moves',
          '',
          'Ticking **"something didn\'t work right"**, **"I can\'t speak out loud right now"** or **"I\'d rather type than talk"** says the *voice path* is the problem, not the recall. So the primary becomes **"switch to typing"** rather than asking the student again to do the thing they just said they could not do.',
          '',
          '**"Leave anyway" stays the secondary throughout.** Leaving is always one tap, so the sheet never becomes a trap of its own.',
          '',
          "That also keeps the sheet inside `buttonGroup`'s two slots. A third action would need a component the library does not have.",
          '',
          '### Differences from Figma screen 10',
          '',
          '- **The sheet has its own surface, in `background/page`.** 10 leaves it unfilled and dims it along with everything behind it, so the sheet has no edge. It is painted here — but deliberately *not* in `background/surface`, despite that token\'s description naming bottom sheets: `button`\'s Secondary variant is also `background/surface`, so "leave anyway" lost its pill and read as bare text. On `background/page`, under a scrim that dims everything behind, the sheet still reads as lifted and every control keeps the contrast it has elsewhere.',
          '- **The top corners are `Radius/600`.** 10 reports a radius of 0, which comes with the missing fill.',
          '- **Rows are at least 44px tall.** 10 hugs its text at 24-32px, under the touch-target floor. `checkboxRow` carries `Target/Minimum`, so the inter-row gap closes to `Space/0` and all eight still fit without scrolling.',
          '- **The grabber is 32px wide, not 36.** 36 is not a token step.',
          '- **The buttons are size L.** 10 uses `Vertical`/`M`.',
        ].join('\n'),
      },
    },
  },
  args: {
    onKeepReviewing: fn(),
    onSwitchToTyping: fn(),
    onLeave: fn(),
    onDismiss: fn(),
  },
} satisfies Meta<typeof AbandonSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing ticked. The primary asks them to stay. */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('dialog')).toBeVisible();
    // All eight reasons are offered. The input itself is visually hidden
    // behind checkbox's drawn box, so presence is the assertion, not
    // visibility — the text beside it is what the student reads.
    for (const reason of ABANDON_REASONS) {
      await expect(
        canvas.getByRole('checkbox', { name: reason.label }),
      ).toBeInTheDocument();
      await expect(canvas.getByText(reason.label)).toBeVisible();
    }
    await expect(
      canvas.getByRole('button', { name: 'Keep reviewing' }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Keep reviewing' }));
    await expect(args.onKeepReviewing).toHaveBeenCalled();
  },
};

/**
 * The swap. Ticking a reason typing would solve turns the primary into
 * "switch to typing" — and "leave anyway" has not moved.
 */
export const SwapsToTyping: Story = {
  name: 'Ticking a voice reason offers typing',
  play: async ({ canvas, args }) => {
    await userEvent.click(
      canvas.getByRole('checkbox', { name: "I'd rather type than talk" }),
    );

    await expect(
      canvas.getByRole('button', { name: 'Switch to typing' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Keep reviewing' }),
    ).not.toBeInTheDocument();
    // The escape never moves.
    await expect(canvas.getByRole('button', { name: 'Leave anyway' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Switch to typing' }));
    await expect(args.onSwitchToTyping).toHaveBeenCalled();
  },
};

/** A reason typing would not solve leaves the primary alone. */
export const NonVoiceReasonKeepsPrimary: Story = {
  name: 'A non-voice reason keeps the primary',
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'The question was bad' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Keep reviewing' }),
    ).toBeVisible();
  },
};

/** Leaving is one tap from the moment the sheet opens, whatever is ticked. */
export const LeaveIsAlwaysOneTap: Story = {
  name: 'Leaving is always one tap',
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Leave anyway' }));
    await expect(args.onLeave).toHaveBeenCalled();
  },
};

/** Several reasons at once — it is a multi-select, not a radio group. */
export const MultipleReasons: Story = {
  name: 'Several reasons at once',
  args: { selected: ['mic', 'cannot-speak', 'awkward'] },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('checkbox', { name: 'I feel awkward talking to the app' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('button', { name: 'Switch to typing' }),
    ).toBeVisible();
  },
};
