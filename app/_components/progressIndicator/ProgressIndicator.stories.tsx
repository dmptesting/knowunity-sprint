import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { ProgressIndicator } from './ProgressIndicator';

/**
 * The component description below is progressIndicator's own `.description`
 * field in Figma, quoted verbatim, followed by the places this build knowingly
 * departs from the file.
 */
const meta = {
  title: 'Components/progressIndicator',
  component: ProgressIndicator,
  tags: ['autodocs'],
  parameters: {
    // The bar fills its parent, so each story supplies the screen's side insets
    // itself rather than relying on Storybook's default padding.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Stepped progress ring, 2 colors, 2 thicknesses, 5 fixed progress steps (0/25/50/75/100), default text "0/12."',
          '',
          '**USE:** progress against a fixed count of steps (e.g. a 12-step lesson), not a free percentage. Real usage is only thickness=16, only progress 0 and 25.',
          '',
          "**DON'T:** don't treat progress as continuous, it only has 5 steps. Thickness=24 and progress 50-100 are unverified, no real instance found.",
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### How to use it',
          '',
          '- **Pass an `aria-label`** naming what is progressing (e.g. "Recall progress"). It renders as a `progressbar`, which needs an accessible name, and only the screen using it knows what it measures.',
          '- **Map steps to `progress` yourself.** The sprint\'s recall session is fixed at 4 questions, which lands exactly on the five steps: 0, 1, 2, 3 and 4 answered are `0`, `25`, `50`, `75` and `100`.',
          '- **`showText` only works at thickness `24`.** Figma\'s Unit Progress layer only exists in those variants; at thickness `16` the prop does nothing.',
          '',
          '### Departures from Figma',
          '',
          '- **The description says "ring"; every variant is a horizontal bar.** The quote above is left verbatim, but there is no ring shape anywhere in the set.',
          '- **Container stroke uses `border/default`, not `border/subtle`.** Figma binds the stroke to `border/subtle`, a variable that is no longer in the file\'s semantic collection (deleted, with the binding left behind) and was never exported to `tokens.json`. `border/default` resolves to `color/alpha/light-10`, the same 10% white Figma renders. The Figma binding still needs switching to match.',
          '- **Corner radius snapped from 12 to `Radius/Full`.** Figma\'s root and Container carry an unbound 12, and there is no 12px radius token. 12 is already at least half of every height in the set (24, 20, 16), so every variant was a pill already. `Radius/Full` renders identically.',
          '- **Width fills the parent instead of a fixed 350px.** Figma\'s 350 is 390 minus 20px on each side, and there is no 20px space token. The stories inset the bar by `Space/600` on each side, the same screen inset calloutBubble uses, giving 342px at the 390px viewport.',
          '- **Heights and inset were unbound in Figma; bound here to exact matches.** Thickness `24` is `Space/600`, `16` is `Space/400`, and thickness `24`\'s 2px Container inset is `Space/050`.',
          '- **`unitProgress` is a prop Figma doesn\'t have.** Figma\'s Unit Progress text is hard-coded per variant ("0/12", "3/12", "6/12", "9/12", "12/12"), out of 12, which would be wrong for a 4-question session. The prop has no default, so placeholder copy can never ship; with no `unitProgress`, `showText` renders nothing. Its count is also exposed as `aria-valuetext`.',
          '- **The count changes ink where it sits on the fill.** Figma draws it in `interactive/onSecondary` at every step, which fails WCAG AA over the fill (3.14:1 on Primary, 2.3:1 on Coral; 4.5:1 needed). Over the track it keeps `interactive/onSecondary`; over the fill it takes the fill\'s paired ink (`accent/brand/onBold` or `accent/coral/onBold`). At progress `50` the count straddles the fill\'s edge, so it is drawn in both inks and split exactly at that edge. At `0` and `25` the count is drawn in the track ink only, at `75` and `100` in the fill ink only. That choice assumes a bar about as wide as the 390px screen allows.',
          '- **Two additions Figma has no spec for:** `progressbar` semantics (`aria-valuenow` is the step\'s percentage), and no motion between steps, because the file specifies none.',
          '- **`Coral` binds `accent/coral/bold`,** a hue-named token design-system.md calls existing debt. Carried through as Figma binds it, not extended.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          paddingInline: 'var(--dimension-space-600)',
          paddingBlock: 'var(--dimension-space-600)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['Primary', 'Coral'],
      description: 'Figma variant property `variant`.',
    },
    thickness: {
      control: 'inline-radio',
      options: ['24', '16'],
      description: 'Figma variant property `thickness`.',
    },
    progress: {
      control: 'inline-radio',
      options: ['0', '25', '50', '75', '100'],
      description: 'Figma variant property `progress`. Five fixed steps only.',
    },
    showText: {
      control: 'boolean',
      description: 'Figma property `showText`. Only has an effect at thickness `24`.',
    },
    unitProgress: {
      control: 'text',
      description: 'The step count shown by `showText`, e.g. "2/4". Not a Figma property.',
    },
  },
  args: {
    variant: 'Primary',
    thickness: '24',
    progress: '0',
    showText: false,
    'aria-label': 'Recall progress',
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every variant story checks the bar reports the step its `progress` names. */
const expectStep: Story['play'] = async ({ canvas, args }) => {
  await expect(
    canvas.getByRole('progressbar', { name: 'Recall progress' })
  ).toHaveAttribute('aria-valuenow', args.progress);
};

/** showText stories also check the count is visible and announced. */
const expectStepWithText: Story['play'] = async (context) => {
  const { canvas, args } = context;
  await expectStep(context);
  // At progress=50 the count is drawn twice, once per ink, split at the
  // fill's edge — so check every copy rather than expecting exactly one.
  for (const count of canvas.getAllByText(args.unitProgress as string)) {
    await expect(count).toBeVisible();
  }
  await expect(canvas.getByRole('progressbar')).toHaveAttribute(
    'aria-valuetext',
    args.unitProgress
  );
};

/* -------------------------------------------------------------------------
 * One story per Primary variant in the Figma component set, named exactly as
 * Figma names it. The Coral variants deliberately have no stories.
 * ---------------------------------------------------------------------- */

export const Primary24Progress0: Story = {
  name: 'variant=Primary, thickness=24, progress=0',
  args: { variant: 'Primary', thickness: '24', progress: '0' },
  play: expectStep,
};

export const Primary24Progress25: Story = {
  name: 'variant=Primary, thickness=24, progress=25',
  args: { variant: 'Primary', thickness: '24', progress: '25' },
  play: expectStep,
};

export const Primary24Progress50: Story = {
  name: 'variant=Primary, thickness=24, progress=50',
  args: { variant: 'Primary', thickness: '24', progress: '50' },
  play: expectStep,
};

export const Primary24Progress75: Story = {
  name: 'variant=Primary, thickness=24, progress=75',
  args: { variant: 'Primary', thickness: '24', progress: '75' },
  play: expectStep,
};

export const Primary24Progress100: Story = {
  name: 'variant=Primary, thickness=24, progress=100',
  args: { variant: 'Primary', thickness: '24', progress: '100' },
  play: expectStep,
};

/** The one thickness with real usage. */
export const Primary16Progress0: Story = {
  name: 'variant=Primary, thickness=16, progress=0',
  args: { variant: 'Primary', thickness: '16', progress: '0' },
  play: expectStep,
};

/** The one thickness with real usage. */
export const Primary16Progress25: Story = {
  name: 'variant=Primary, thickness=16, progress=25',
  args: { variant: 'Primary', thickness: '16', progress: '25' },
  play: expectStep,
};

export const Primary16Progress50: Story = {
  name: 'variant=Primary, thickness=16, progress=50',
  args: { variant: 'Primary', thickness: '16', progress: '50' },
  play: expectStep,
};

export const Primary16Progress75: Story = {
  name: 'variant=Primary, thickness=16, progress=75',
  args: { variant: 'Primary', thickness: '16', progress: '75' },
  play: expectStep,
};

export const Primary16Progress100: Story = {
  name: 'variant=Primary, thickness=16, progress=100',
  args: { variant: 'Primary', thickness: '16', progress: '100' },
  play: expectStep,
};

/* -------------------------------------------------------------------------
 * showText=true. The Unit Progress layer only exists at thickness=24, so these
 * cover every Primary thickness=24 variant. Counts follow the sprint's fixed
 * 4-question session rather than Figma's placeholder "x/12".
 * ---------------------------------------------------------------------- */

export const Primary24Progress0ShowText: Story = {
  name: 'variant=Primary, thickness=24, progress=0, showText=true',
  args: { variant: 'Primary', thickness: '24', progress: '0', showText: true, unitProgress: '0/4' },
  play: expectStepWithText,
};

export const Primary24Progress25ShowText: Story = {
  name: 'variant=Primary, thickness=24, progress=25, showText=true',
  args: { variant: 'Primary', thickness: '24', progress: '25', showText: true, unitProgress: '1/4' },
  play: expectStepWithText,
};

/** The count sits right on the fill's edge here — half on the fill, half on the track. */
export const Primary24Progress50ShowText: Story = {
  name: 'variant=Primary, thickness=24, progress=50, showText=true',
  args: { variant: 'Primary', thickness: '24', progress: '50', showText: true, unitProgress: '2/4' },
  play: expectStepWithText,
};

export const Primary24Progress75ShowText: Story = {
  name: 'variant=Primary, thickness=24, progress=75, showText=true',
  args: { variant: 'Primary', thickness: '24', progress: '75', showText: true, unitProgress: '3/4' },
  play: expectStepWithText,
};

export const Primary24Progress100ShowText: Story = {
  name: 'variant=Primary, thickness=24, progress=100, showText=true',
  args: { variant: 'Primary', thickness: '24', progress: '100', showText: true, unitProgress: '4/4' },
  play: expectStepWithText,
};

/**
 * Not a Figma variant — a behaviour check. Figma has no Unit Progress layer at
 * thickness=16, so `showText` is ignored there rather than cramming a 9px count
 * into a 16px bar.
 */
export const ShowTextIgnoredAt16: Story = {
  name: 'showText=true is ignored at thickness=16',
  args: { variant: 'Primary', thickness: '16', progress: '25', showText: true, unitProgress: '1/4' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('1/4')).toBeNull();
    // Still announced to screen readers, just not drawn.
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '1/4');
  },
};
