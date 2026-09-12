import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { AppBar } from './AppBar';
import { ProgressIndicator } from '../progressIndicator/ProgressIndicator';
import { CloseIcon } from '../icons/UiIcons';

/**
 * The component description below is appBar's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/appBar',
  component: AppBar,
  tags: ['autodocs'],
  parameters: {
    // The bar spans the screen, so it gets no padding of its own here.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Top nav bar shell, 6 icon/button layout variants, content Slot. Zero real instances found anywhere scanned (Example Screens, Strategy flows).',
          '',
          '**USE:** (unverified) top navigation, variant chosen by how many header actions the screen needs.',
          '',
          "**DON'T:** (unverified) don't mismatch Slot content to the chosen variant's icon/button layout.",
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### What each variant holds',
          '',
          '| variant | contents |',
          '| --- | --- |',
          '| `default` | Slot only |',
          '| `leftIconButtonOnly` | back + Slot |',
          '| `leftAndRightIconButton` | back + Slot + overflow |',
          '| `leftAndRightButton` | back + Slot + text action |',
          '| `leftAndTwoRightIconButtons` | back + Slot + share + overflow |',
          '| `leftAnd2RightButtons` | back + Slot + overflow + text action |',
          '',
          '### Also worth knowing',
          '',
          "- **The Slot is the point.** Figma's `Slot` property stretches its child on insert, which is how the recall header works: a `progressIndicator` between a dismiss action and a skip. See the last story.",
          '- **`leftAndRightButton` is the sprint\'s skip escape hatch,** already designed in the file. "Never trap the student" is a hard constraint, and this variant is where it lives in the header.',
          '- **Zero real instances anywhere.** design-system.md flags appBar as structurally complete but unproven, so check the result against the rest of the system rather than trusting the variant grid.',
          '',
          '### Departures from Figma',
          '',
          "- **It fills its parent instead of a fixed 375px.** 375 is an older iPhone width, not this prototype's 390, and no token matches it.",
          '- **The two nested button families are rebuilt on the button\'s stylesheet.** "App Bar Button Icon" and "App Bar Button" are their own Figma component sets (one variant, four states each), not instances of `buttonIcon` or `button`. Rather than import two more families, both are drawn here from `Button.module.css`\'s Tertiary rules — same transparent fill, same focus ring, same `text/primary` ink. Their `Pressed`, `Disabled` and `Loading` states are **not** surfaced as props.',
          '- **The doubled gradient is reproduced.** Figma stacks two identical `background/page`-to-transparent linear gradients. The duplicate looks accidental, but both render and together they change the alpha curve, so both are drawn. Only the colour is token-bound — `tokens.json` has no gradient tokens, so the stops and direction are plain CSS.',
          '- **The text action defaults to "Skip", not "CTA Text".** Figma\'s placeholder would be shipped copy; "Skip" is the word the variant actually carries in the file.',
          '- **Icons are Material Symbols (rounded):** `arrow_back` for the file\'s `arrow-left`, `more_vert` for `dots-vertical`, `ios_share` for `share-02`.',
          '- **`<header>` with real buttons.** Figma has no semantics to carry over; every action is a named button so the bar is operable and announced as a banner.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'leftIconButtonOnly',
        'leftAndRightIconButton',
        'leftAndRightButton',
        'leftAndTwoRightIconButtons',
        'leftAnd2RightButtons',
      ],
      description: 'Figma variant property `variant`.',
    },
    rightCTA: {
      control: 'text',
      description: "Figma property `Text` on the nested App Bar Button.",
    },
    leftLabel: { control: 'text', description: 'Accessible name for the leading action.' },
  },
  args: {
    variant: 'default',
    leftLabel: 'Back',
    rightCTA: 'Skip',
    onLeftClick: fn(),
    onRightClick: fn(),
    onSecondRightClick: fn(),
    onRightCTAClick: fn(),
  },
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------
 * One story per variant in the Figma component set, named exactly as Figma
 * names it.
 * ---------------------------------------------------------------------- */

/** Slot only — no actions at all. */
export const Default: Story = {
  name: 'variant=default',
  args: { variant: 'default' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toBeVisible();
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const LeftIconButtonOnly: Story = {
  name: 'variant=leftIconButtonOnly',
  args: { variant: 'leftIconButtonOnly' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(args.onLeftClick).toHaveBeenCalledTimes(1);
  },
};

export const LeftAndRightIconButton: Story = {
  name: 'variant=leftAndRightIconButton',
  args: { variant: 'leftAndRightIconButton' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await expect(args.onRightClick).toHaveBeenCalledTimes(1);
  },
};

/** The skip escape hatch: a text action on the right. */
export const LeftAndRightButton: Story = {
  name: 'variant=leftAndRightButton',
  args: { variant: 'leftAndRightButton' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onRightCTAClick).toHaveBeenCalledTimes(1);
  },
};

/** Figma leads this pair with share, then the overflow menu. */
export const LeftAndTwoRightIconButtons: Story = {
  name: 'variant=leftAndTwoRightIconButtons',
  args: { variant: 'leftAndTwoRightIconButtons' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Share' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'More options' })).toBeVisible();
  },
};

export const LeftAnd2RightButtons: Story = {
  name: 'variant=leftAnd2RightButtons',
  args: { variant: 'leftAnd2RightButtons' },
};

/* -------------------------------------------------------------------------
 * The Slot, which is what the component exists for.
 * ---------------------------------------------------------------------- */

/**
 * The recall loop's header, and the reason appBar was worth building: dismiss
 * on the left, the session's progress stretched across the Slot, skip on the
 * right. Both ways out of the session live here.
 *
 * `x-close`, not `arrow-left`, because leaving mid-session is a dismiss — it
 * surfaces the abandon sheet rather than navigating back.
 */
export const RecallHeader: Story = {
  name: 'Real usage — the recall header',
  args: {
    variant: 'leftAndRightButton',
    leftIcon: <CloseIcon />,
    leftLabel: 'Close',
    rightCTA: 'Skip',
  },
  render: (args) => (
    <AppBar {...args}>
      <ProgressIndicator
        variant="Primary"
        thickness="16"
        progress="25"
        aria-label="Recall progress"
      />
    </AppBar>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(canvas.getByRole('progressbar', { name: 'Recall progress' })).toHaveAttribute(
      'aria-valuenow',
      '25'
    );
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeVisible();
  },
};
