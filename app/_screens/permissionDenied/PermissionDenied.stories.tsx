import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { PermissionDenied } from './PermissionDenied';

const meta = {
  title: 'Screens/Permission denied',
  component: PermissionDenied,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The dead end the feature cannot afford. Getting a refused permission back means digging through OS or browser settings, so this screen does two things: it says how, and it makes sure the student does not have to.',
          '',
          '**Text is the primary action. The mic is the optional one.** The session switches to text mode and carries on.',
          '',
          '### No apology, no error treatment',
          '',
          'Refusing the mic is a reasonable choice — the student may be on a bus, in a library, or sharing a room. Nothing here is painted in `feedback/error`; SPEC.md reserves the feedback family for a pass, and this is not even a miss.',
          '',
          '### Composed like the primer',
          '',
          "It is the primer's other outcome — the same tap on \"let's get started\", answered no — so it uses the primer's composition: centred 3XL mascot, one large message at Headline S, no bubble. The recovery steps sit well below at Body S Regular in `text/secondary`: they are for the few who want their voice back, not the headline.",
          '',
          "They used to be a `textBlock` with a bold 18px title, the same weight as the message above it — so an optional note competed with what every student needs to hear.",
          '',
          '### Decisions, since there is no frame for this one',
          '',
          "- **No `CalloutBubble`**, although SPEC.md's component list names one. The primer dropped its bubble for a bare centred line, and centred under a centred mascot the bubble's fixed left-pointing tail points at nothing. This screen follows.",
          '- **The secondary action is "try the mic again", not "open settings".** No web API can open a browser permission pane, so a button claiming to would be a lie. The block says where to go; the button is there for when they come back.',
          '- **No header.** Like the primer, the session has not started, so there is no progress to show and nothing to skip.',
        ].join('\n'),
      },
    },
  },
  args: {
    onContinueInText: fn(),
    onTryAgain: fn(),
  },
} satisfies Meta<typeof PermissionDenied>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The state itself: what happened, how to undo it, and the way forward. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Continue in text' }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Try the mic again' }),
    ).toBeVisible();
  },
};

/**
 * Never a dead end: the primary action carries the session on in text. This is
 * the check SPEC.md's verification step 5 asks for.
 */
export const ContinuesInText: Story = {
  name: 'Continuing in text',
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continue in text' }));
    await expect(args.onContinueInText).toHaveBeenCalled();
  },
};

/** For a student who has just changed the setting and wants another go. */
export const RetriesTheMic: Story = {
  name: 'Trying the mic again',
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Try the mic again' }));
    await expect(args.onTryAgain).toHaveBeenCalled();
  },
};
