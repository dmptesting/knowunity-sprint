import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { HintCard } from './HintCard';

/**
 * The component description below is hintCard's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/hintCard',
  component: HintCard,
  tags: ['autodocs'],
  parameters: {
    // The card fills its parent, so each story supplies the sheet's side insets
    // itself rather than relying on Storybook's default padding.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'A supportive hint surface for a recall question, shown when the student asks for help before or during their spoken answer.',
          '',
          '**USE:** inside the question bottom sheet.',
          '',
          "**DON'T:** use it to reveal the correct answer outright; it should nudge, not solve.",
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### Also worth knowing',
          '',
          '- **Unproven in a real composition.** design-system.md flags this one: the real "Hint" text on screen 08 floats directly on the bottom sheet with no card at all, so this card treatment is a deliberate new version. Check it reads as a hint and not as a generic card before shipping it.',
          "- **Each hint viewed costs XP.** The sprint's ladder is hint 1, re-attempt, hint 2, re-attempt, then reveal — so a card appearing is a scored event, not just decoration. Viewing a hint always routes back to a re-attempt; it never auto-reveals.",
          '- **The "Hint" label is fixed.** It is a plain text layer in Figma, not a property, so it is not a prop here either.',
          '',
          '### Departures from Figma',
          '',
          '- **It fills its parent instead of a fixed 342px.** 342 is 390 minus `Space/600` a side, and there is no token for that width. The stories inset it by `Space/600`, reproducing 342px at the 390px viewport.',
          '- **`role="note"` was added.** Figma has no semantics to carry over; the role marks the card as supporting content about the question rather than part of it.',
          '- **Nothing else.** Fill, radius, padding, gap and both text styles are bound exactly as Figma binds them.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--dimension-space-600)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    body: { control: 'text', description: 'The hint itself. Not a Figma property.' },
  },
  args: {
    body: 'Think about length versus complexity: which one multiplies the number of guesses an attacker needs faster?',
  },
} satisfies Meta<typeof HintCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The card as Figma ships it: the first hint on the password question. */
export const Default: Story = {
  name: 'Default — hint 1',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('note')).toBeVisible();
    await expect(canvas.getByText('Hint')).toBeVisible();
    await expect(canvas.getByText(args.body)).toBeVisible();
  },
};

/**
 * The second hint in the ladder, which is more pointed but still stops short of
 * the answer — the line the description draws.
 */
export const SecondHint: Story = {
  name: 'Hint 2 — more pointed, still not the answer',
  args: {
    body: 'Every extra character multiplies the guesses needed. Compare that with swapping one letter for a symbol.',
  },
};

/** One short nudge, the shortest the card gets. */
export const Short: Story = {
  name: 'Short hint',
  args: { body: 'Start with what the attacker has to try.' },
};
