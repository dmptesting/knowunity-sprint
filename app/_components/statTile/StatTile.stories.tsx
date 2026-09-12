import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { StatTile } from './StatTile';

/**
 * The component description below is statTile's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/statTile',
  component: StatTile,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'A compact badge that surfaces a single numeric stat (XP earned, streak count, accuracy percent) tied to accent/blue.',
          '',
          '**USE:** inline after a recall attempt or on a summary screen when one number deserves emphasis.',
          '',
          "**DON'T:** use it for multi-line content or anything longer than a short label + short value; it isn't a card.",
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### Also worth knowing',
          '',
          '- **This one has real backing.** design-system.md records that its fill, stroke, radius and text colours are all confirmed against a real "Stat - XP" instance in the file. Only its padding and internal gap were a judgment call, because the real instance is not built with auto-layout.',
          '- **`accent/blue` is hue-named debt,** per design-system.md. Carried through because it is what Figma binds and what the real instance shows — not a pattern to extend.',
          '- **The sprint summary shows XP, number correct and time,** so three of these sit side by side there. `value` is a string, since the "+" and "%" are part of the number as written.',
          '',
          '### Departures from Figma',
          '',
          '- **It is a description list, not two bare text layers.** `<dl>`/`<dt>`/`<dd>` ties the label to its value for screen readers, which two unrelated spans would not. Figma has no equivalent, so this is an addition rather than a change.',
          '- **Nothing else.** Every fill, stroke, radius, gap, padding and text style is bound exactly as the Figma component binds it.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'What the number is. Not a Figma property.' },
    value: { control: 'text', description: 'The number itself. Not a Figma property.' },
  },
  args: { label: 'XP', value: '+18' },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The tile exactly as Figma ships it, down to the copy. */
export const Default: Story = {
  name: 'Default — XP +18',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('XP')).toBeVisible();
    await expect(canvas.getByText('+18')).toBeVisible();
  },
};

/**
 * The three stats the sprint's summary screen shows — XP, number correct and
 * time — which is the only place several tiles appear together.
 */
export const SummaryRow: Story = {
  name: 'On the summary screen',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--dimension-space-200)' }}>
      <StatTile label="XP" value="+18" />
      <StatTile label="Correct" value="3/4" />
      <StatTile label="Time" value="2:09" />
    </div>
  ),
};
