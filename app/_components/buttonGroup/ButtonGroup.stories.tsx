import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { ButtonGroup } from './ButtonGroup';
import { CloseIcon } from '../icons/UiIcons';

/**
 * The component description below is buttonGroup's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/buttonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: {
    // The group fills its parent, so each story supplies the screen's side
    // insets itself rather than relying on Storybook's default padding.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Wrapper pairing two button instances (Primary + Secondary by default).',
          '',
          '**USE:** a primary + secondary action pair. Real usage is 100% Horizontal/size L.',
          '',
          "**DON'T:** adding a third button is unverified, not confirmed as enforced, just not seen.",
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### The two variants hold different things',
          '',
          "- **`Vertical`** stacks a Primary button over a Secondary one, both full width. This is the shape the beta's abandon sheet uses: \"Keep learning\" over \"Leave anyway\".",
          '- **`Horizontal`** pairs a Secondary **buttonIcon** with a Primary button that takes the remaining width. Figma builds the variant that way, which is worth flagging because the description says "two button instances" and design-system.md says "one Primary + one Secondary button" — neither mentions the icon button.',
          '',
          '### Also worth knowing',
          '',
          '- **It composes, it does not restyle.** The buttons are the existing `button` and `buttonIcon` components, so fills, sizes, states and focus rings come from them.',
          '- **`Horizontal` needs `secondaryIcon` and `secondaryLabel`;** `Vertical` needs `secondaryCTA`. Passing the wrong pair leaves the icon button named "Secondary action" or the label button showing Figma\'s "1/2 words" placeholder.',
          '',
          '### Departures from Figma',
          '',
          '- **It fills its parent instead of a fixed 319px.** No token matches 319, and a pair of actions spans the screen.',
          '- **The gap is `Space/200` at both sizes.** Figma reads `Space/0` at M and `Space/200` at L, but its M buttons sit in 48px wrappers around 40px buttons, so those 4px insets already produce the same 8px visual gap. One token now covers both.',
          '- **Size M is 44px tall,** inherited from the button and buttonIcon components, which both snap Figma\'s 40px M to `Space/300`.',
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
    variant: {
      control: 'inline-radio',
      options: ['Horizontal', 'Vertical'],
      description: 'Figma variant property `variant`.',
    },
    size: {
      control: 'inline-radio',
      options: ['M', 'L'],
      description: 'Figma variant property `size`.',
    },
    primaryCTA: { control: 'text', description: 'Primary button label.' },
    secondaryCTA: { control: 'text', description: 'Secondary button label. Vertical only.' },
    secondaryLabel: {
      control: 'text',
      description: 'Accessible name for the icon button. Horizontal only.',
    },
  },
  args: {
    variant: 'Vertical',
    size: 'M',
    primaryCTA: 'Keep learning',
    secondaryCTA: 'Leave anyway',
    onPrimaryClick: fn(),
    onSecondaryClick: fn(),
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------
 * One story per variant in the Figma component set, named exactly as Figma
 * names it. Labels are real sprint copy in sentence case, not Figma's
 * "1/2 words" placeholder.
 * ---------------------------------------------------------------------- */

export const VerticalM: Story = {
  name: 'variant=Vertical, size=M',
  args: { variant: 'Vertical', size: 'M' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Keep learning' }));
    await expect(args.onPrimaryClick).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Leave anyway' }));
    await expect(args.onSecondaryClick).toHaveBeenCalledTimes(1);
  },
};

export const VerticalL: Story = {
  name: 'variant=Vertical, size=L',
  args: { variant: 'Vertical', size: 'L' },
};

export const HorizontalM: Story = {
  name: 'variant=Horizontal, size=M',
  args: {
    variant: 'Horizontal',
    size: 'M',
    primaryCTA: 'Continue',
    secondaryIcon: <CloseIcon />,
    secondaryLabel: 'Close',
  },
};

export const HorizontalL: Story = {
  name: 'variant=Horizontal, size=L',
  args: {
    variant: 'Horizontal',
    size: 'L',
    primaryCTA: 'Continue',
    secondaryIcon: <CloseIcon />,
    secondaryLabel: 'Close',
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(args.onSecondaryClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * The shape the sprint actually needs: the abandon sheet's pair, where the
 * primary action keeps the student in the session and the secondary one is the
 * way out. Vertical, because both labels are sentence-length.
 */
export const RealUsage: Story = {
  name: 'Real usage — the abandon sheet',
  args: {
    variant: 'Vertical',
    size: 'L',
    primaryCTA: 'Keep learning',
    secondaryCTA: 'Leave anyway',
  },
};
