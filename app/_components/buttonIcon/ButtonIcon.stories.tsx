import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { ButtonIcon } from './ButtonIcon';
import { CloseIcon, MicIcon } from '../icons/UiIcons';

/**
 * The component description below is buttonIcon's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/buttonIcon',
  component: ButtonIcon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Icon-only twin of button, same variant/size/state grid, no label frame.',
          '',
          '**USE:** icon-only actions. Real usage is 100% Secondary, never Primary or size S.',
          '',
          '**DON\'T:** don\'t expect visible text; a stray "Button" text node found nested in some real instances is very likely an unused leftover, not real content.',
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### Also worth knowing',
          '',
          '- **It shares the button\'s stylesheet.** Because Figma calls it the same grid, emphasis and state come from `Button.module.css` rather than being restated — one set of fills, press overlays and disabled treatment for both components. Only the square sizing is its own.',
          '- **`label` is required.** An icon-only button has no visible text, so it needs an accessible name. Figma has no property for it.',
          "- **Pair it with `x-close` for dismiss.** That icon's own description: use it wherever the action is 'close this,' not 'go back.'",
          '- **`square` is Figma\'s placeholder icon,** shown when no `icon` is passed. Never ship it as real content.',
          '',
          '### Departures from Figma',
          '',
          '- **Size M is 44px, not 40px.** Figma\'s inner box is 40px, which needs 10px of padding, and the Space scale steps 8px to 12px with nothing between. Snapped to `Space/300`, the same snap the button already discloses for its own M — which also keeps an icon button and a label button the same height inside buttonGroup. S (32px) and L (56px) match Figma exactly.',
          '- **S keeps its 32px drawing but gets a 44px target.** buttonIcon reuses the button stylesheet, so the same transparent `::after` expands S to `Target/Minimum`. M and L are already at or above it, so nothing changes there.',
          '- **Tertiary keeps its padding.** Figma shrinks the Tertiary box to the icon itself (20px at M), which is far below the 44px minimum touch target. Padding is kept so the target survives; with no fill, it still reads as Tertiary.',
          '- **No inner shadow.** Figma\'s wrapper carries a 15%-black inner shadow the button ignores too; left out so the two stay consistent.',
          '- **Icons are Material Symbols (rounded),** as everywhere else in this build, and coloured with `currentColor` so the glyph inherits the button\'s own token-bound colour.',
          '- **A focus ring and no hover,** both inherited from the button stylesheet: Figma defines no focus state, and this prototype is mobile-only.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['Primary', 'Secondary', 'Tertiary'],
      description: 'Figma variant property `variant`.',
    },
    size: {
      control: 'inline-radio',
      options: ['S', 'M', 'L'],
      description: 'Figma variant property `size`.',
    },
    state: {
      control: 'inline-radio',
      options: ['Default', 'Pressed', 'Disabled', 'Loading'],
      description: 'Figma variant property `state`.',
    },
    label: { control: 'text', description: 'Accessible name. Not a Figma property.' },
  },
  args: {
    variant: 'Primary',
    size: 'S',
    state: 'Default',
    label: 'Placeholder action',
    onClick: fn(),
  },
} satisfies Meta<typeof ButtonIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------
 * One story per variant in the Figma component set, named exactly as Figma
 * names it.
 * ---------------------------------------------------------------------- */

/* ---- Primary ---- */
export const PrimarySDefault: Story = {
  name: 'variant=Primary, size=S, state=Default',
  args: { variant: 'Primary', size: 'S', state: 'Default' },
};
export const PrimarySPressed: Story = {
  name: 'variant=Primary, size=S, state=Pressed',
  args: { variant: 'Primary', size: 'S', state: 'Pressed' },
};
export const PrimarySDisabled: Story = {
  name: 'variant=Primary, size=S, state=Disabled',
  args: { variant: 'Primary', size: 'S', state: 'Disabled' },
};
export const PrimarySLoading: Story = {
  name: 'variant=Primary, size=S, state=Loading',
  args: { variant: 'Primary', size: 'S', state: 'Loading' },
};
export const PrimaryMDefault: Story = {
  name: 'variant=Primary, size=M, state=Default',
  args: { variant: 'Primary', size: 'M', state: 'Default' },
};
export const PrimaryMPressed: Story = {
  name: 'variant=Primary, size=M, state=Pressed',
  args: { variant: 'Primary', size: 'M', state: 'Pressed' },
};
export const PrimaryMDisabled: Story = {
  name: 'variant=Primary, size=M, state=Disabled',
  args: { variant: 'Primary', size: 'M', state: 'Disabled' },
};
export const PrimaryMLoading: Story = {
  name: 'variant=Primary, size=M, state=Loading',
  args: { variant: 'Primary', size: 'M', state: 'Loading' },
};
export const PrimaryLDefault: Story = {
  name: 'variant=Primary, size=L, state=Default',
  args: { variant: 'Primary', size: 'L', state: 'Default' },
};
export const PrimaryLPressed: Story = {
  name: 'variant=Primary, size=L, state=Pressed',
  args: { variant: 'Primary', size: 'L', state: 'Pressed' },
};
export const PrimaryLDisabled: Story = {
  name: 'variant=Primary, size=L, state=Disabled',
  args: { variant: 'Primary', size: 'L', state: 'Disabled' },
};
export const PrimaryLLoading: Story = {
  name: 'variant=Primary, size=L, state=Loading',
  args: { variant: 'Primary', size: 'L', state: 'Loading' },
};

/* ---- Secondary ---- */
export const SecondarySDefault: Story = {
  name: 'variant=Secondary, size=S, state=Default',
  args: { variant: 'Secondary', size: 'S', state: 'Default' },
};
export const SecondarySPressed: Story = {
  name: 'variant=Secondary, size=S, state=Pressed',
  args: { variant: 'Secondary', size: 'S', state: 'Pressed' },
};
export const SecondarySDisabled: Story = {
  name: 'variant=Secondary, size=S, state=Disabled',
  args: { variant: 'Secondary', size: 'S', state: 'Disabled' },
};
export const SecondarySLoading: Story = {
  name: 'variant=Secondary, size=S, state=Loading',
  args: { variant: 'Secondary', size: 'S', state: 'Loading' },
};
export const SecondaryMDefault: Story = {
  name: 'variant=Secondary, size=M, state=Default',
  args: { variant: 'Secondary', size: 'M', state: 'Default' },
};
export const SecondaryMPressed: Story = {
  name: 'variant=Secondary, size=M, state=Pressed',
  args: { variant: 'Secondary', size: 'M', state: 'Pressed' },
};
export const SecondaryMDisabled: Story = {
  name: 'variant=Secondary, size=M, state=Disabled',
  args: { variant: 'Secondary', size: 'M', state: 'Disabled' },
};
export const SecondaryMLoading: Story = {
  name: 'variant=Secondary, size=M, state=Loading',
  args: { variant: 'Secondary', size: 'M', state: 'Loading' },
};
export const SecondaryLDefault: Story = {
  name: 'variant=Secondary, size=L, state=Default',
  args: { variant: 'Secondary', size: 'L', state: 'Default' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Placeholder action' });
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const SecondaryLPressed: Story = {
  name: 'variant=Secondary, size=L, state=Pressed',
  args: { variant: 'Secondary', size: 'L', state: 'Pressed' },
};
export const SecondaryLDisabled: Story = {
  name: 'variant=Secondary, size=L, state=Disabled',
  args: { variant: 'Secondary', size: 'L', state: 'Disabled' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Placeholder action' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const SecondaryLLoading: Story = {
  name: 'variant=Secondary, size=L, state=Loading',
  args: { variant: 'Secondary', size: 'L', state: 'Loading' },
  play: async ({ canvas }) => {
    // The glyph is swapped for a spinner, but the name still comes from `label`.
    const button = canvas.getByRole('button', { name: 'Placeholder action' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
  },
};

/* ---- Tertiary ---- */
export const TertiarySDefault: Story = {
  name: 'variant=Tertiary, size=S, state=Default',
  args: { variant: 'Tertiary', size: 'S', state: 'Default' },
};
export const TertiarySPressed: Story = {
  name: 'variant=Tertiary, size=S, state=Pressed',
  args: { variant: 'Tertiary', size: 'S', state: 'Pressed' },
};
export const TertiarySDisabled: Story = {
  name: 'variant=Tertiary, size=S, state=Disabled',
  args: { variant: 'Tertiary', size: 'S', state: 'Disabled' },
};
export const TertiarySLoading: Story = {
  name: 'variant=Tertiary, size=S, state=Loading',
  args: { variant: 'Tertiary', size: 'S', state: 'Loading' },
};
export const TertiaryMDefault: Story = {
  name: 'variant=Tertiary, size=M, state=Default',
  args: { variant: 'Tertiary', size: 'M', state: 'Default' },
};
export const TertiaryMPressed: Story = {
  name: 'variant=Tertiary, size=M, state=Pressed',
  args: { variant: 'Tertiary', size: 'M', state: 'Pressed' },
};
export const TertiaryMDisabled: Story = {
  name: 'variant=Tertiary, size=M, state=Disabled',
  args: { variant: 'Tertiary', size: 'M', state: 'Disabled' },
};
export const TertiaryMLoading: Story = {
  name: 'variant=Tertiary, size=M, state=Loading',
  args: { variant: 'Tertiary', size: 'M', state: 'Loading' },
};
export const TertiaryLDefault: Story = {
  name: 'variant=Tertiary, size=L, state=Default',
  args: { variant: 'Tertiary', size: 'L', state: 'Default' },
};
export const TertiaryLPressed: Story = {
  name: 'variant=Tertiary, size=L, state=Pressed',
  args: { variant: 'Tertiary', size: 'L', state: 'Pressed' },
};
export const TertiaryLDisabled: Story = {
  name: 'variant=Tertiary, size=L, state=Disabled',
  args: { variant: 'Tertiary', size: 'L', state: 'Disabled' },
};
export const TertiaryLLoading: Story = {
  name: 'variant=Tertiary, size=L, state=Loading',
  args: { variant: 'Tertiary', size: 'L', state: 'Loading' },
};

/* -------------------------------------------------------------------------
 * `icon` is a slot rather than a Figma variant axis, so these have no variant
 * name of their own.
 * ---------------------------------------------------------------------- */

/**
 * The shape it actually takes in the product: Secondary, a real icon, and a
 * name that says what the action does. `x-close` always means dismiss.
 */
export const RealUsage: Story = {
  name: 'Real usage — Secondary/L with x-close',
  args: {
    variant: 'Secondary',
    size: 'L',
    icon: <CloseIcon />,
    label: 'Close',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeVisible();
  },
};

/** The other icon the recall loop reaches for. */
export const WithMic: Story = {
  name: 'Secondary/L with mic',
  args: {
    variant: 'Secondary',
    size: 'L',
    icon: <MicIcon />,
    label: 'Start speaking',
  },
};
