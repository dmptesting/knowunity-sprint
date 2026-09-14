import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { KnowieSays } from './KnowieSays';

const meta = {
  title: 'Components/knowieSays',
  component: KnowieSays,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          "Knowie beside his own speech bubble.",
          '',
          '**USE:** anywhere in the recall loop where Knowie says something — the question on a turn, his line on the reveal, his line on the denied screen.',
          '',
          "**DON'T:** put the student's words in it. The bubble is Knowie's, and a transcript belongs in a `textBlock`.",
          '',
          '### Why it exists',
          '',
          'It was built inline on **four** screens — reveal, permission denied, voice turn and text turn — with the same markup and the same four CSS declarations each time, and never logged in `component-gaps.md` at all. A spec review caught it. Four sightings where the rule is promote on the second.',
          '',
          '### Mascot left, bubble right',
          '',
          "`calloutBubble`'s tail is fixed pointing left, so this is the one arrangement where it points at anything. Screen 03 is the only real frame pairing the two and draws it this way; `MascotSlot`'s own \"Above a calloutBubble\" story records the stacked alternative as an open question precisely because the tail then points at nothing.",
          '',
          '### Fixed at 2XL',
          '',
          'All four screens use that size, and nothing else reads well beside a bubble at 390px — `3XL` is 200px and would leave the bubble 150. The primer stacks a `3XL` above its copy instead, which is a different composition, not this one. No size prop, because no screen has needed one.',
          '',
          '**Talking is on-screen text only.** Knowie never gets audio.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--dimension-space-400)' }}>
        <Story />
      </div>
    ),
  ],
  args: { body: 'What makes a password resistant to brute-force attacks?' },
} satisfies Meta<typeof KnowieSays>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The question on a turn — what three of the four usages are. */
export const Default: Story = {
  name: 'Asking the question',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(args.body)).toBeVisible();
  },
};

/** `thinking`, which SPEC.md reserves for the reveal. */
export const Thinking: Story = {
  args: {
    expression: 'thinking',
    body: "No shame in this one. Here's the answer, so you've got it for next time.",
  },
};

/** `approving`, which SPEC.md reserves for a pass. */
export const Approving: Story = {
  args: { expression: 'approving', body: "That's it." },
};

/** Long copy wraps and the bubble grows downward; the mascot stays centred on it. */
export const Wrapping: Story = {
  name: 'Long copy wraps',
  args: {
    body: 'Explain how a hash function protects a stored password, and why adding a salt makes a precomputed table useless to an attacker.',
  },
};
