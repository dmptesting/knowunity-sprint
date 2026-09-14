import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { StatusNotice } from './StatusNotice';
import { NOTICES, type NoticeKind } from '../../_recall/notices';

/*
 * `chargesLadder` is session bookkeeping, not a prop — statusNotice spreads
 * what it is given onto a div, and React warns about unknown DOM attributes.
 * This takes only the two fields the component actually has.
 */
const pick = (kind: NoticeKind) => ({
  body: NOTICES[kind].body,
  retryCTA: NOTICES[kind].retryCTA,
});

const meta = {
  title: 'Components/statusNotice',
  component: StatusNotice,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'One region, four copy sets: nothing heard, heard badly, taking too long, or offline.',
          '',
          '**USE:** on a turn screen, where the voice circle\'s hint line sits, when something went wrong with the *attempt* rather than with the *answer*.',
          '',
          "**DON'T:** use it for a verdict. A verdict judges what the student said; this reports that we couldn't judge it at all, and the two must not look alike.",
          '',
          '### Not an error',
          '',
          'Painted in `accent/brand/subtle` with `text/secondary` copy, exactly as SPEC.md specifies — deliberately **not** `feedback/error` or `feedback/warning`. None of these four is the student\'s fault, and an alarm would say otherwise.',
          '',
          '**None of them charges the hint ladder.** Nothing was judged, so spending a rung would punish the student for our microphone.',
          '',
          '### It announces itself',
          '',
          '`role="status"` — a screen reader hears the change without focus moving. That is the accessible form of the Voice UX Reference\'s first principle: show system status at every moment.',
          '',
          '### Why it is a component',
          '',
          'Not in Figma and not in design-system.md, but two screens need it — the voice turn and the text turn both reach timeout and network — and it carries four states of its own, so it was built properly rather than inline.',
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
  args: { onRetry: fn() },
} satisfies Meta<typeof StatusNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing came through at all. Free — the ladder is not charged. */
export const Empty: Story = {
  args: pick('empty'),
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent(args.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

/** Something came through, but not enough of it to judge. Also free. */
export const Garbled: Story = {
  args: pick('garbled'),
};

/**
 * Past the 4s target. The copy softens and the processing state holds — there
 * is no decision to make yet, so no button is offered.
 */
export const TimeoutSoft: Story = {
  name: 'Timeout — 4s, softened',
  args: pick('timeoutSoft'),
  play: async ({ canvas }) => {
    // A wait, not a decision: nothing to press.
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

/** Past 8s. Now there is a decision, so it is offered — but it never errors out. */
export const TimeoutRetry: Story = {
  name: 'Timeout — 8s, retry offered',
  args: pick('timeoutRetry'),
};

/** Offline. Progress and XP are kept; the in-flight attempt is discarded. */
export const Network: Story = {
  args: pick('network'),
};

/** All five side by side, the only way to judge whether they read as one family. */
export const AllNotices: Story = {
  name: 'All five notices',
  args: pick('empty'),
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--dimension-space-400)',
      }}
    >
      {(['empty', 'garbled', 'timeoutSoft', 'timeoutRetry', 'network'] as const).map(
        (kind) => (
          <StatusNotice key={kind} {...pick(kind)} onRetry={args.onRetry} />
        ),
      )}
    </div>
  ),
};
