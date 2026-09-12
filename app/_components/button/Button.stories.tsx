import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Button } from './Button';

/**
 * The component description below is the button's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Primary/Secondary/Tertiary CTA button, 3 sizes, 4 states.',
          '',
          '**USE:** single primary or secondary action, 1-2 word label (default placeholder is literally "1/2 words"). Real usage is almost entirely Primary/L labeled "Check."',
          '',
          '**DON\'T:** no sentence-length labels. Disabled and Loading states are unverified, no real instance found in either state.',
          '',
          '_Quoted from the component\'s `.description` field in Figma._',
          '',
          '### Also worth knowing',
          '',
          '- Labels are sentence case. Capitals only for proper nouns (Knowie, Knowunity).',
          '- `1/2 words` and the `square` icon are Figma\'s own placeholders. Never ship either as if it were real content.',
          '- Every value is bound to a custom property from `build/css/tokens.css`. Nothing is a raw hex or a raw pixel number.',
          '',
          '### Departures from Figma',
          '',
          '- **Size M is 44px tall, not 40px.** Figma fixes M at 40px, which needs 10px of padding-block; the Space scale steps 8px to 12px with nothing between. Snapped up to `Space/300`. S (32px) and L (56px) match Figma exactly.',
          '- **S and Tertiary S/M keep Figma\'s painted size but not its target.** S is 32px and Tertiary S/M collapse to a 20px line box (their `padding-block` is `Space/0`), both under the touch floor. A transparent centred `::after` expands the tappable area to `Target/Minimum` (44px) without changing what is drawn; it is a no-op on M and L.',
          '- **Secondary has no border.** Figma\'s Secondary carries `strokeWeight: 3` but an empty strokes array, so no paint renders.',
          '- **Tertiary Pressed looks like Tertiary Default.** Figma\'s treatment is a 10%-white overlay on a label that is already `text/primary` (#f4f2ff), which is imperceptible. Not substituted with a stronger effect.',
          '- **Secondary Loading uses `text/primary` for the spinner.** Figma binds that hidden label to `interactive/onPrimary` (#090c18), near-invisible on `background/surface` — read as leftover from duplicating the Primary variant.',
          '- **A focus ring was added.** Figma defines none, and the button is not keyboard-operable without one. Built from `stroke/heavyBorder` and `interactive/primary`.',
          '- **No hover state.** Figma has no Hover variant and this prototype is mobile-only, so Pressed is the only pointer feedback.',
          '- **Font weights are written as 600/700.** tokens.json stores weight as a Figma keyword (`semi-bold`), which is not valid CSS. Same mapping `stories/foundations/TypeFoundations.tsx` already uses.',
          '- The spinner\'s 1s rotation is unbound — tokens.json carries no motion tokens. It respects `prefers-reduced-motion`.',
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
    CTA: { control: 'text', description: 'Figma property `CTA` \u2014 the label.' },
    showLeftIcon: { control: 'boolean', description: 'Figma property `showLeftIcon`.' },
    showRightIcon: { control: 'boolean', description: 'Figma property `showRightIcon`.' },
  },
  args: {
    variant: 'Primary',
    size: 'S',
    state: 'Default',
    CTA: '1/2 words',
    showLeftIcon: false,
    showRightIcon: false,
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

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
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: '1/2 words' });
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const PrimaryLPressed: Story = {
  name: 'variant=Primary, size=L, state=Pressed',
  args: { variant: 'Primary', size: 'L', state: 'Pressed' },
};
export const PrimaryLDisabled: Story = {
  name: 'variant=Primary, size=L, state=Disabled',
  args: { variant: 'Primary', size: 'L', state: 'Disabled' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: '1/2 words' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const PrimaryLLoading: Story = {
  name: 'variant=Primary, size=L, state=Loading',
  args: { variant: 'Primary', size: 'L', state: 'Loading' },
  play: async ({ canvas, args }) => {
    // The label is hidden while loading, but it still names the button.
    const button = canvas.getByRole('button', { name: '1/2 words' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
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
};
export const SecondaryLPressed: Story = {
  name: 'variant=Secondary, size=L, state=Pressed',
  args: { variant: 'Secondary', size: 'L', state: 'Pressed' },
};
export const SecondaryLDisabled: Story = {
  name: 'variant=Secondary, size=L, state=Disabled',
  args: { variant: 'Secondary', size: 'L', state: 'Disabled' },
};
export const SecondaryLLoading: Story = {
  name: 'variant=Secondary, size=L, state=Loading',
  args: { variant: 'Secondary', size: 'L', state: 'Loading' },
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
 * The two icon properties, which are component properties in Figma rather
 * than variant axes, so they have no variant name of their own.
 * ---------------------------------------------------------------------- */

export const ShowLeftIcon: Story = {
  name: 'showLeftIcon=true',
  args: { variant: 'Primary', size: 'L', showLeftIcon: true },
};

export const ShowRightIcon: Story = {
  name: 'showRightIcon=true',
  args: { variant: 'Primary', size: 'L', showRightIcon: true },
};

export const ShowBothIcons: Story = {
  name: 'showLeftIcon=true, showRightIcon=true',
  args: { variant: 'Primary', size: 'L', showLeftIcon: true, showRightIcon: true },
};

/**
 * The shape the button actually takes in the product: Primary, size L, one
 * word, sentence case. Everything above is the variant grid; this is the
 * instance the recall loop uses.
 */
export const RealUsage: Story = {
  name: 'Real usage \u2014 Primary/L "Check"',
  args: { variant: 'Primary', size: 'L', CTA: 'Check' },
};
