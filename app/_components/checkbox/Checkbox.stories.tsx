import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { CheckboxRow } from '../checkboxRow/CheckboxRow';
import { Checkbox } from './Checkbox';

/**
 * The component description below is the checkbox's own `.description` field in
 * Figma, quoted verbatim, followed by the places this build knowingly departs
 * from the file.
 */
const meta = {
  title: 'Components/checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'Selection control. Check/uncheck for lists, onboarding checklists, multi-select, T&C acceptance.',
          '',
          "_Quoted from the component's `.description` field in Figma._",
          '',
          '### Also worth knowing',
          '',
          '- **Unproven in a shipped composition.** The set lives in Figma (local, with six variants and its own description); design-system.md lists it under code-only components with no real usage yet. Treat it like appBar, snackbar and textBlock: structurally complete, unverified.',
          "- **Where the sprint uses it:** the multi-reason abandon sheet, which sprint-context.md keeps rather than cutting. The shipped beta's sheet shows exactly this round control against reasons like \"I'd rather type than talk.\"",
          '- **It draws a circle, not a square.** `Radius/Full` on a 24px box. Worth knowing because a round multi-select reads as a radio group to most people; the beta sheet does the same thing.',
          '- **`label` is required.** The Figma component is the box alone, with no label layer, so nothing in the design names it.',
          '',
          '### Departures from Figma',
          '',
          "- **The selected fill uses `highlight/border`.** Figma binds it to `highlight/indicator`, a variable that is no longer in the file's semantic collection and was never exported to `tokens.json`. `highlight/border` is the token for \"edge of a chosen element\", so it covers both the ring and the fill — the selected circle becomes the unselected ring filled in. It is a shade darker than Figma's current value (#7b65e0 against #9d85ff), which also lifts the check glyph's contrast.",
          '- **The selected error fill uses `feedback/error/subtle`.** Figma binds `feedback/errorSurface`, also missing from `tokens.json`. `feedback/error/subtle` is the token for a tinted error background.',
          '- **A real `<input type="checkbox">` sits behind the drawing.** Figma has no interactive semantics; this keeps native keyboard operation, the checked state, and screen-reader announcement. `Error` sets `aria-invalid`, `Disabled` sets `disabled`.',
          '- **A focus ring was added,** from `Stroke/Heavy Border` and `border/focus`. Figma defines none, and the control is not operable without one.',
          '- **No hover or pressed state,** because Figma defines neither and this prototype is mobile-only.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    selection: {
      control: 'inline-radio',
      options: ['Unselected', 'Selected'],
      description: 'Figma variant property `Selection`.',
    },
    state: {
      control: 'inline-radio',
      options: ['Default', 'Error', 'Disabled'],
      description: 'Figma variant property `State`.',
    },
    label: { control: 'text', description: 'Accessible name. Not a Figma property.' },
  },
  args: {
    selection: 'Unselected',
    state: 'Default',
    label: "I'd rather type than talk",
    onChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------
 * One story per variant in the Figma component set, named exactly as Figma
 * names it.
 * ---------------------------------------------------------------------- */

export const UnselectedDefault: Story = {
  name: 'Selection=Unselected, State=Default',
  args: { selection: 'Unselected', state: 'Default' },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('checkbox', { name: "I'd rather type than talk" });
    await expect(box).not.toBeChecked();
    await userEvent.click(box);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const SelectedDefault: Story = {
  name: 'Selection=Selected, State=Default',
  args: { selection: 'Selected', state: 'Default' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('checkbox', { name: "I'd rather type than talk" })
    ).toBeChecked();
  },
};

export const UnselectedError: Story = {
  name: 'Selection=Unselected, State=Error',
  args: { selection: 'Unselected', state: 'Error' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  },
};

export const UnselectedDisabled: Story = {
  name: 'Selection=Unselected, State=Disabled',
  args: { selection: 'Unselected', state: 'Disabled' },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('checkbox');
    await expect(box).toBeDisabled();
    await userEvent.click(box);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const SelectedError: Story = {
  name: 'Selection=Selected, State=Error',
  args: { selection: 'Selected', state: 'Error' },
};

export const SelectedDisabled: Story = {
  name: 'Selection=Selected, State=Disabled',
  args: { selection: 'Selected', state: 'Disabled' },
};

/**
 * The place the sprint uses it: the multi-reason abandon sheet that appears if
 * the student leaves mid-session. Each row is a reason, the box is the control,
 * and the whole row is the label — which is how the shipped beta does it. The
 * pairing is `checkboxRow`, so this renders that rather than rebuilding it.
 */
export const InAbandonSheet: Story = {
  name: 'In the abandon sheet',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        // checkboxRow carries Target/Minimum, so the rows need no gap — the
        // same call the abandon sheet makes.
        gap: 'var(--dimension-space-0)',
        padding: 'var(--dimension-space-600)',
      }}
    >
      {[
        "I don't understand how this works",
        "I can't speak out loud right now",
        "I'd rather type than talk",
      ].map((reason, i) => (
        <CheckboxRow key={reason} label={reason} checked={i === 2} onCheckedChange={fn()} />
      ))}
    </div>
  ),
};
