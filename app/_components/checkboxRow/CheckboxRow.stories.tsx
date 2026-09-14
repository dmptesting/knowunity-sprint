import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { CheckboxRow } from './CheckboxRow';

const meta = {
  title: 'Components/checkboxRow',
  component: CheckboxRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'A checkbox with its text beside it: label on the left, box on the right.',
          '',
          '**USE:** any list of options the student picks from — the abandon sheet\'s reasons, the primer\'s tap-mode toggle.',
          '',
          "**DON'T:** pair it with a second label elsewhere on the row. The row's own text is the control's accessible name, and naming it twice is worse than not naming it at all.",
          '',
          '### Why it exists',
          '',
          "`checkbox` is the box alone. Its own docs say so: *\"Figma's component is the box alone, with no label layer, so nothing in the design names it.\"* Every real usage therefore has to supply the text and make the whole row the target — the primer's tap-mode toggle did it by hand, then the abandon sheet needed the same thing eight times over. Second sighting, so it was promoted out of both.",
          '',
          '### Accessibility',
          '',
          '- The `<label>` wraps both, so tapping the **text** toggles the box and the row is one target rather than a 24px one.',
          '- `aria-label={undefined}` on the box stops the name being announced twice.',
          '- The row carries `Target/Minimum` (44px). Screen 10 draws rows as short as 24px, which is under the floor on its own; this keeps every option tappable without changing what is painted.',
          '',
          '### Departures from Figma',
          '',
          '- **The row is at least 44px tall.** Screen 10\'s rows hug their text at 24-32px.',
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
  args: {
    label: "I'd rather type than talk",
    checked: false,
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof CheckboxRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unselected, which is how every option starts. */
export const Unchecked: Story = {
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('checkbox', { name: args.label });
    await expect(box).not.toBeChecked();

    // Tapping the text, not the box, still toggles it.
    await userEvent.click(canvas.getByText(args.label));
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

/** Selected. */
export const Checked: Story = {
  args: { checked: true },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('checkbox', { name: args.label })).toBeChecked();
  },
};

/** Disabled — greyed and inert. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('checkbox', { name: args.label })).toBeDisabled();
  },
};

/** Long copy wraps and the box stays put, which screen 10 needs twice. */
export const Wrapping: Story = {
  name: 'Long copy wraps',
  args: {
    label: "I can't speak out loud right now (I'm around people / in public)",
  },
};
