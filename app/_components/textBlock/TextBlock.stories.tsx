import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { TextBlock } from './TextBlock';

/**
 * The component description below is textBlock's own structure in Figma
 * (component set `9003:9039`), followed by the places this build knowingly
 * departs from the file.
 */
const meta = {
  title: 'Components/textBlock',
  component: TextBlock,
  tags: ['autodocs'],
  parameters: {
    // The block fills its parent, so each story supplies the screen's side
    // insets itself rather than relying on Storybook's default padding.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'A title paired with an optional caption, at four size steps.',
          '',
          '**USE:** body copy on a screen that needs a real text style rather than a card — an answer, a transcript, an explanation.',
          '',
          "**DON'T:** put the screen's payload in `caption`. It is Caption M/S Regular at `text/secondary`, sized to qualify the title, not to carry the thing the student came to read.",
          '',
          '_textBlock carries no `.description` field in Figma, so unlike the rest of the library there is nothing to quote. The two lines above are this build\'s reading of the component, not the file\'s own words._',
          '',
          '### Also worth knowing',
          '',
          '- **Zero real instances exist.** design-system.md is explicit that appBar, snackbar and textBlock have never appeared in a shipped screen, so the variant grid is structure, not proof. Check the result on the screen.',
          '- **Alignment comes with the variant.** XL and L centre their text; M and S are left aligned. That is how the four variants are drawn in Figma, so it is not exposed as a separate prop.',
          '- **`title` is required and has no default.** Figma\'s placeholder is "Header"; shipping it would be shipping placeholder copy.',
          '',
          '### Departures from Figma',
          '',
          '- **It fills its parent instead of hugging a fixed width.** Figma\'s four variants hug at whatever width the instance was drawn to. The block fills instead, so the screen supplies the insets — the same convention `calloutBubble` and `progressIndicator` already follow.',
          '- **The caption carries no extra opacity.** Figma\'s Caption node is bound to `text/secondary` *and* set to 67.8% opacity. That figure is the token\'s own alpha (`--color-text-secondary` resolves to `rgba(245, 243, 255, 0.6784)`), so applying it again would double it.',
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
      options: ['XL', 'L', 'M', 'S'],
      description: 'Figma variant `variant`.',
    },
    title: { control: 'text', description: 'Figma property `title`.' },
    caption: { control: 'text', description: 'Figma property `caption`.' },
    showCaption: { control: 'boolean', description: 'Figma property `showCaption`.' },
  },
  args: {
    variant: 'XL',
    title: 'Nice work',
    caption: 'You explained three of four unaided.',
    showCaption: true,
  },
} satisfies Meta<typeof TextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- the four variants, as Figma draws them ---------------------------- */

/** Figma's default variant: Display M over Headline XS Regular, centred. */
export const VariantXl: Story = {
  name: 'variant=XL',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(args.title)).toBeVisible();
    await expect(canvas.getByText(args.caption!)).toBeVisible();
  },
};

/** Headline XL over Headline XS Regular, centred. */
export const VariantL: Story = {
  name: 'variant=L',
  args: { variant: 'L' },
};

/** Body M Bold over Caption M Regular, left aligned. The step body copy uses. */
export const VariantM: Story = {
  name: 'variant=M',
  args: {
    variant: 'M',
    title: 'Length. Every extra character multiplies the number of guesses an attacker has to try.',
    caption: 'Hint used, so this one scores no XP.',
  },
};

/** Body S Bold over Caption S Regular, left aligned. The smallest step. */
export const VariantS: Story = {
  name: 'variant=S',
  args: {
    variant: 'S',
    title: 'What we heard',
    caption: 'a longer password is harder to crack because there are more combinations',
  },
};

/* --- behaviour ---------------------------------------------------------- */

/**
 * `showCaption={false}` — a single run of copy with nothing qualifying it.
 * This is the shape the reveal screen uses: the answer sits in `title`,
 * because `caption` is 12px at `text/secondary` and cannot carry the one thing
 * that screen exists to show.
 */
export const TitleOnly: Story = {
  name: 'showCaption=false',
  args: {
    variant: 'M',
    title: 'Length. Every extra character multiplies the number of guesses an attacker has to try.',
    showCaption: false,
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(args.title)).toBeVisible();
    await expect(canvas.queryByText(args.caption!)).not.toBeInTheDocument();
  },
};

/**
 * Long copy wraps and the block grows downward. Worth checking at M, since
 * that is the step a multi-sentence answer or transcript lands in.
 */
export const Wrapping: Story = {
  name: 'Long copy wraps',
  args: {
    variant: 'M',
    title:
      'Length is what matters most. Each extra character multiplies the number of possible combinations, so a long passphrase beats a short password full of symbols.',
    caption: 'Two hints used, so this one scores no XP.',
  },
};
