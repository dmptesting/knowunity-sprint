import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { PathNode } from './PathNode';

/**
 * The component description below is pathNode's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/pathNode',
  component: PathNode,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'A step in the study-plan learning path. Shows completion state (completed/current/upcoming) and which flow tapping it opens (quiz or explain-out-loud voice recall).',
          '',
          '**USE:** reach for it to build any path/roadmap list.',
          '',
          "**DON'T:** change its Label to anything longer than a lesson title; it isn't built to wrap.",
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### How the two axes interact',
          '',
          '**The icon says what the step is. The marker fill says how far along you are.** Every progress state shows its own format icon; only the marker changes, and each marker draws its icon in the on-* token paired with its fill.',
          '',
          '- `completed` — solid success marker (`feedback/success/bold`), icon in `feedback/success/onBold`, no stroke.',
          '- `current` — brand marker (`accent/brand/subtle`) with a `Stroke/Heavy Border` stroke, icon in `text/primary`. The only bordered state, and the "you are here" node.',
          '- `upcoming` — surface marker (`background/surface`), icon in `text/primary`, no stroke.',
          '',
          '### Departures from Figma',
          '',
          '- **Icons are Material Symbols (rounded), not the Figma glyphs.** Swapped by design decision. A side effect worth knowing: all icons now share Material\'s 960 grid, which fixed a real defect \u2014 Figma\'s `mic` had kept voiceCircle\'s 40px-box geometry when it was promoted, so in the 24px slot it drew 23.33\u00d731.67 against ai-quiz\'s 18.87\u00d722. Measured in the browser, the glyphs now sit within 1px of each other.',
          '- **`completed` shows its format icon, not check-circle.** Figma and design-system.md both specify check-circle for `completed` "regardless of `format`", on the reasoning that format stops mattering once a node is done. Overridden by design decision: the icon now always identifies the step and the green fill alone marks it done. check-circle is no longer drawn anywhere in this component.',
          '- **A knock-on:** `completed` and `upcoming` now differ **by marker fill colour alone** for a given format. Voice UX Reference principle 1 warns that "colour alone isn\'t enough". Accepted deliberately for now. Screen readers are unaffected — the hidden text still announces "completed" or "upcoming" — but sighted students have only the green fill to go on.',
          '- **`completed` uses `feedback/success/bold`, not `accent/green/subtle`.** Changed by design decision, and the better semantic fit — that token\'s own description is "Solid success fill, used for correct answer banners, completion states", where `accent/green` is hue-named debt per design-system.md. Its icon takes the paired `feedback/success/onBold` (7.49:1). White would have been 2.08:1, under the 3:1 minimum for icons.',
          '- **Two additions Figma has no spec for:** a keyboard focus ring (built from `Stroke/Heavy Border` + `accent/brand/bold`), and a visually hidden text suffix naming the progress and format, since both are otherwise conveyed by colour and icon alone. No hover (mobile only) and no pressed state, since the file defines neither.',
          '- **`label` is a required prop with no default.** Figma\'s Label is a plain text layer rather than an exposed property, and each variant ships a different placeholder lesson title. Requiring it keeps placeholder copy from shipping.',
          '',
          '### Already-disclosed substitution',
          '',
          "The 48px marker is `Space/1200`. design-system.md records that the real reference ellipse on screen 01 is 46px, which has no matching token, so it was snapped to the nearest real step. That substitution predates this build and is carried through unchanged.",
        ].join('\n'),
      },
    },
  },
  argTypes: {
    progress: {
      control: 'inline-radio',
      options: ['completed', 'current', 'upcoming'],
      description: 'Figma variant property `progress`.',
    },
    format: {
      control: 'inline-radio',
      options: ['quiz', 'explainOutLoud'],
      description:
        'Figma variant property `format`. Ignored visually when `progress` is `completed`.',
    },
    label: { control: 'text', description: 'The lesson title. Not a Figma property.' },
  },
  args: {
    progress: 'completed',
    format: 'quiz',
    label: 'Network devices',
    onClick: fn(),
  },
} satisfies Meta<typeof PathNode>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------
 * One story per variant in the Figma component set, named exactly as Figma
 * names it. Labels are real lesson titles in sentence case, not Figma's
 * Title Case placeholders.
 * ---------------------------------------------------------------------- */

/** Completed keeps its quiz icon too — the rule applies to both formats. */
export const CompletedQuiz: Story = {
  name: 'progress=completed, format=quiz',
  args: { progress: 'completed', format: 'quiz', label: 'Network devices' },
  play: async ({ canvas, args }) => {
    const node = canvas.getByRole('button', {
      name: 'Network devices , quiz, completed',
    });
    await userEvent.click(node);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** Completed, but still recognisably a speaking step: mic, not a checkmark. */
export const CompletedExplainOutLoud: Story = {
  name: 'progress=completed, format=explainOutLoud',
  args: {
    progress: 'completed',
    format: 'explainOutLoud',
    label: 'Protocol layers',
  },
};

export const CurrentQuiz: Story = {
  name: 'progress=current, format=quiz',
  args: { progress: 'current', format: 'quiz', label: 'Protocol layers' },
  play: async ({ canvas }) => {
    // The "you are here" node is the only one marked as the current step.
    await expect(
      canvas.getByRole('button', { name: 'Protocol layers , quiz, current step' })
    ).toHaveAttribute('aria-current', 'step');
  },
};

export const CurrentExplainOutLoud: Story = {
  name: 'progress=current, format=explainOutLoud',
  args: {
    progress: 'current',
    format: 'explainOutLoud',
    label: 'Explain out loud',
  },
};

export const UpcomingQuiz: Story = {
  name: 'progress=upcoming, format=quiz',
  args: { progress: 'upcoming', format: 'quiz', label: 'Network weaknesses' },
};

export const UpcomingExplainOutLoud: Story = {
  name: 'progress=upcoming, format=explainOutLoud',
  args: {
    progress: 'upcoming',
    format: 'explainOutLoud',
    label: 'Explain out loud',
  },
};

/**
 * The node in the context it exists for: a study-plan path read top to bottom,
 * completed steps above the current one, upcoming below. Also the clearest
 * place to check that the three markers read as distinct from one another.
 */
export const AsAPath: Story = {
  name: 'In a path list',
  render: () => (
    <ol
      style={{
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--dimension-space-400)',
        padding: 'var(--dimension-space-400)',
        margin: 'var(--dimension-space-0)',
      }}
    >
      {[
        { progress: 'completed', format: 'quiz', label: 'Network devices' },
        { progress: 'completed', format: 'explainOutLoud', label: 'Protocol layers' },
        { progress: 'current', format: 'explainOutLoud', label: 'Explain out loud' },
        { progress: 'upcoming', format: 'quiz', label: 'Network weaknesses' },
        { progress: 'upcoming', format: 'explainOutLoud', label: 'Routing basics' },
      ].map((node) => (
        <li key={node.label}>
          <PathNode
            progress={node.progress as 'completed' | 'current' | 'upcoming'}
            format={node.format as 'quiz' | 'explainOutLoud'}
            label={node.label}
          />
        </li>
      ))}
    </ol>
  ),
};
