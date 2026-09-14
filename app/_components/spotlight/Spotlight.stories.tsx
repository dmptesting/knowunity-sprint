import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Spotlight } from './Spotlight';
import { RECALL_SCRIPT } from '../../_recall/script';

const Q3 = RECALL_SCRIPT[2];

const meta = {
  title: 'Components/Spotlight',
  component: Spotlight,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'One piece of information given the whole screen: a small label, then the body large and centred, and optionally a quiet footnote.',
          '',
          '**Not a Figma component.** Built on its second sighting — the hint overlay and the answer page both needed the identical arrangement (see `component-gaps.md`).',
          '',
          '### Size',
          '',
          '`size` sets the body only, and each step is a whole headline text style from tokens.json. `labelSize` sets the label on its own: `S` (default) is Caption M Bold (12px), `M` is Headline XS Bold (18px), `L` is Headline S (21px). The label is `accent/brand/bold` at every size.',
          '',
          '| `size` | Text style |',
          '|---|---|',
          '| `XL` (default) | Headline XL — 44/44, −1% |',
          '| `L` | Headline L — 33/36, −1% |',
          '| `M` | Headline M — 28/28, −1% |',
          '| `S` | Headline S — 21/24, 0% |',
          '',
          '### Layout',
          '',
          'It fills the region it is put in (`flex: 1`) and centres itself there, with Space/600 around and Space/400 between. Centred with auto margins rather than `justify-content`, so copy that ever overflows scrolls from the top instead of being clipped.',
          '',
          '### Focus',
          '',
          '`focusOnMount` moves focus onto the body when it appears — for a screen that replaced the one before without the student moving focus. The body is not a tab stop.',
          '',
          '**USE:** a screen that exists to show a single statement — a hint, a revealed answer.',
          '',
          "**DON'T:** put Knowie or a bubble beside it, or use it for more than a short paragraph.",
        ].join('\n'),
      },
    },
  },
  args: {
    label: 'Hint 1',
    body: Q3.hints[0],
    size: 'XL',
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spotlight>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Headline XL body. */
export const ExtraLarge: Story = {
  name: 'XL',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(args.label)).toBeVisible();
    await expect(canvas.getByText(args.body)).toBeVisible();
  },
};

export const Large: Story = {
  name: 'L',
  args: { label: 'Answer', size: 'L', body: RECALL_SCRIPT[3].answer },
};

export const Medium: Story = {
  name: 'M',
  args: { label: 'Answer', size: 'M', body: Q3.answer },
};

export const Small: Story = {
  name: 'S',
  args: { label: 'Answer', size: 'S', body: RECALL_SCRIPT[1].answer },
};

/** The hint overlay's pairing: a Headline S label over a Headline S hint. */
export const LargeLabel: Story = {
  name: 'Large label',
  args: { labelSize: 'L', size: 'S' },
  play: async ({ canvas, args }) => {
    await expect(getComputedStyle(canvas.getByText(args.label)).fontSize).toBe('21px');
    await expect(getComputedStyle(canvas.getByText(args.body)).fontSize).toBe('21px');
  },
};

/** The quiet line under the body. */
export const WithFootnote: Story = {
  name: 'With a footnote',
  args: {
    label: 'Answer',
    size: 'M',
    body: Q3.answer,
    footnote: 'Both hints used, so this one scores no XP.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Both hints used, so this one scores no XP.')).toBeVisible();
  },
};

/** Focus lands on the body, which is not a tab stop. */
export const FocusOnMount: Story = {
  name: 'Focus on mount',
  args: { focusOnMount: true },
  play: async ({ canvas, args }) => {
    const body = canvas.getByText(args.body);
    await expect(body).toHaveFocus();
    await expect(body).toHaveAttribute('tabindex', '-1');
  },
};
