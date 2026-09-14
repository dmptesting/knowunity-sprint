import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { CheckIcon, MicIcon } from '../icons/UiIcons';
import { Chips } from './Chips';

/**
 * The component description below is chips' own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/chips',
  component: Chips,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Compact label with optional side icons, 4 sizes, 2 colors, active/inactive.',
          '',
          '**USE:** 1-2 word labels (default placeholder "1/2 words"). Real usage mostly S/Primary/inactive.',
          '',
          '**DON\'T:** most real instances still carry the unedited placeholder text, only 2 of 11 have real copy, don\'t treat these mockups as final chip content. The "pro" color option is never used in a real instance, unverified.',
          '',
          '_Quoted from the component\'s `.description` field in Figma._',
          '',
          '### Also worth knowing',
          '',
          '- **The 11 real instances the description mentions are gone.** A search of every page in the file today finds exactly one chips instance, the unedited placeholder on the components page. There is no shipped chip left to check a composition against.',
          '- **`color` does nothing while inactive.** Figma\'s inactive Primary and inactive pro variants are identical — `background/surface` with a `text/primary` label. Only an active chip shows its colour.',
          '- **XXS and XS share a text style and icon size** (Caption S Bold, `Icon/150`). XS is only roomier: more padding, wider gap.',
          '- `1/2 words` and the `square` icon are Figma\'s own placeholders. Never ship either as real content.',
          '- snackbar\'s embedded chip points at a chips variant name that no longer exists (design-system.md). Rebuild from this set rather than copying that instance.',
          '',
          '### Departures from Figma',
          '',
          '- **Size M is 44px tall, not 40px.** Figma fixes M at 40px, which needs 10px of padding-block; the Space scale steps 8px to 12px with nothing between. Snapped up to `Space/300`, the same call Button M makes. XXS (20px), XS (24px) and S (32px) match Figma exactly.',
          '- **It is a static tag, not a control.** Rendered as a `<span>`; `active` is visual emphasis only. Figma has no pressed or disabled state and no real usage shows a chip being tapped. If a chip ever needs to toggle (a filter, say), it becomes a button with `aria-pressed` and a `Target/Minimum` hit area — a different component, not a prop on this one.',
          '- **Icons inherit the label colour.** They draw in `currentColor`, so they go dark on an active fill, which is what the Figma render shows.',
          '- **Font weight is written as 600.** tokens.json stores weight as a Figma keyword (`semi-bold`), which is not valid CSS. Same mapping Button uses.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['XXS', 'XS', 'S', 'M'],
      description: 'Figma variant property `size`.',
    },
    color: {
      control: 'inline-radio',
      options: ['Primary', 'pro'],
      description: 'Figma variant property `color`. Only visible when active.',
    },
    active: { control: 'boolean', description: 'Figma variant property `active`.' },
    Text: { control: 'text', description: 'Figma property `Text` — the label.' },
    showLeftIcon: { control: 'boolean', description: 'Figma property `showLeftIcon`.' },
    showRightIcon: { control: 'boolean', description: 'Figma property `showRightIcon`.' },
  },
  args: {
    size: 'XXS',
    color: 'Primary',
    active: false,
    Text: '1/2 words',
    showLeftIcon: true,
    showRightIcon: true,
  },
} satisfies Meta<typeof Chips>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', alignItems: 'center', gap: 'var(--dimension-space-200)' };
const grid = { display: 'grid', gap: 'var(--dimension-space-300)' };

/** The chip exactly as Figma's component set defaults it, placeholders and all. */
export const Default: Story = {
  name: 'Default — XXS, Primary, inactive',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('1/2 words')).toBeVisible();
  },
};

/** The four sizes side by side, inactive, so the height steps can be compared. */
export const Sizes: Story = {
  name: 'All sizes',
  render: (args) => (
    <div style={row}>
      <Chips {...args} size="XXS" Text="Extra small" />
      <Chips {...args} size="XS" Text="Small" />
      <Chips {...args} size="S" Text="Medium" />
      <Chips {...args} size="M" Text="Large" />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const label of ['Extra small', 'Small', 'Medium', 'Large']) {
      await expect(canvas.getByText(label)).toBeVisible();
    }
  },
};

/**
 * The full Figma grid: every size in both colours and both active values.
 * Inactive Primary and inactive pro are identical by design.
 */
export const VariantGrid: Story = {
  name: 'Every variant',
  render: (args) => (
    <div style={grid}>
      {(['Primary', 'pro'] as const).map((color) =>
        ([false, true] as const).map((active) => (
          <div key={`${color}-${active}`} style={row}>
            {(['XXS', 'XS', 'S', 'M'] as const).map((size) => (
              <Chips
                key={size}
                {...args}
                size={size}
                color={color}
                active={active}
                Text={active ? 'Active' : 'Inactive'}
              />
            ))}
          </div>
        )),
      )}
    </div>
  ),
};

/** Active Primary — `interactive/primary` fill, `interactive/onPrimary` label. */
export const ActivePrimary: Story = {
  name: 'Active — Primary',
  args: { size: 'S', active: true, Text: 'Selected' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Selected')).toBeVisible();
  },
};

/** Active pro — `pro/bold` fill. Unverified: no real instance uses it. */
export const ActivePro: Story = {
  name: 'Active — pro (unverified)',
  args: { size: 'S', color: 'pro', active: true, showLeftIcon: false, showRightIcon: false, Text: 'PRO' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('PRO')).toBeVisible();
  },
};

/** Label only — both icon slots switched off. */
export const LabelOnly: Story = {
  name: 'No icons',
  args: { size: 'S', showLeftIcon: false, showRightIcon: false, Text: 'Biology' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Biology')).toBeVisible();
    await expect(canvasElement.querySelector('svg')).toBeNull();
  },
};

/**
 * Real icons swapped into the left slot, the way design-system.md describes
 * chips: a short tag with a side icon. Copy here is illustrative, not taken from
 * a shipped screen — none survive in the file.
 */
export const WithSideIcon: Story = {
  name: 'With a real side icon',
  render: (args) => (
    <div style={row}>
      <Chips
        {...args}
        size="S"
        showRightIcon={false}
        leftIcon={<MicIcon size="var(--dimension-icon-200)" />}
        Text="Explain it"
      />
      <Chips
        {...args}
        size="S"
        active
        showRightIcon={false}
        leftIcon={<CheckIcon size="var(--dimension-icon-200)" />}
        Text="Done"
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Explain it')).toBeVisible();
    await expect(canvas.getByText('Done')).toBeVisible();
  },
};
