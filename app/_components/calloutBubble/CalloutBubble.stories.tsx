import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { CalloutBubble } from './CalloutBubble';

/**
 * The component description below is calloutBubble's own `.description` field
 * in Figma, quoted verbatim, followed by the places this build knowingly
 * departs from the file.
 */
const meta = {
  title: 'Components/calloutBubble',
  component: CalloutBubble,
  tags: ['autodocs'],
  parameters: {
    // The bubble fills its parent, so each story supplies the screen's side
    // insets itself rather than relying on Storybook's default padding.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          "Knowie's speech bubble, used to present the mascot's spoken prompt or question as on-screen text.",
          '',
          '**USE:** anywhere the mascot is "talking," most often the recall question itself.',
          '',
          "**DON'T:** widen the Bubble past its fixed 342px body; long copy should wrap to a second line, not stretch the bubble out.",
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### Also worth knowing',
          '',
          '- **"Talking" is text on screen, never audio.** Knowie never gets a voice — voice in, text out.',
          '- **`body` is a required prop with no default.** Figma\'s Body text is a plain text layer rather than an exposed property, so there is nothing to name it after and no placeholder to ship by accident.',
          '',
          '### Departures from Figma',
          '',
          '- **It fills its parent instead of a fixed 342px.** 342 is 390 minus `Space/600` a side, and there is no token for that width. The stories inset it by `Space/600`, which reproduces 342px at the 390px viewport.',
          '- **The tail is 20×16, not 15×19.** Figma rotates a 15×19 polygon 90°; neither number is a token, so the box is snapped to the nearest real steps (`Icon/250` × `Icon/200`) and the triangle is drawn with `clip-path` rather than a rotated node. Its `Space/Negative 200` overlap with the bubble is exact.',
          "- **The tail has sharp corners.** Figma binds its corner radius to `Radius/100`, but design-system.md records that the binding never renders on a POLYGON, so this matches what the file actually displays rather than what it's bound to.",
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
    body: {
      control: 'text',
      description: "The copy Knowie is 'saying'. Not a Figma property.",
    },
  },
  args: {
    body: 'What makes a password resistant to brute-force attacks?',
  },
} satisfies Meta<typeof CalloutBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The bubble as Figma ships it: a two-line recall question, which is what it
 * exists for.
 */
export const Default: Story = {
  name: 'Default — the recall question',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(args.body)).toBeVisible();
  },
};

/** One short line, the shortest the bubble ever gets. */
export const SingleLine: Story = {
  name: 'Single line',
  args: { body: 'Ready when you are.' },
};

/**
 * The case the description warns about: long copy wraps to more lines and the
 * bubble grows downward, never wider.
 */
export const Wrapping: Story = {
  name: 'Long copy wraps',
  args: {
    body: 'Explain how a hash function protects a stored password, and why adding a salt makes a precomputed table useless to an attacker.',
  },
};
