import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';

import { Screen } from './Screen';
import { AppBar } from '../appBar/AppBar';
import { Button } from '../button/Button';
import { ProgressIndicator } from '../progressIndicator/ProgressIndicator';
import { TextBlock } from '../textBlock/TextBlock';
import { CloseIcon } from '../icons/UiIcons';

/**
 * The phone-frame shell every screen in this prototype composes inside.
 * Not a Figma component — see the departures below.
 */
const meta = {
  title: 'Components/screen',
  component: Screen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'A pinned top region, a scrolling content region, and a pinned bottom action region above the home indicator.',
          '',
          '**USE:** as the outermost element of any screen in this prototype.',
          '',
          "**DON'T:** give it a width. It fills its container, and the container is the phone.",
          '',
          '### Why it exists',
          '',
          'Figma composes every flow screen out of loose `Panel Header` / `topNavigation` / `bottomContent` / `bottomSheetOnly` frames plus a `Status Bar` instance — but there is **no `scaffold` component in the file**, and design-system.md does not document one. Nothing in the React library pinned an app bar to the top and an action row to the bottom of a phone frame. This is that arrangement read off screens 03, 06 and 07 and built as a component, per SPEC.md Step 0a.',
          '',
          '### Departures from Figma',
          '',
          "- **No status bar.** Figma's `Panel Header` holds an iOS `Status Bar` instance (clock, signal, battery). It is OS chrome, not product UI, so it is not drawn and its 48px is not reserved; on a real phone the safe-area inset keeps the app bar clear of the OS bar.",
          '- **The home indicator strip is 32px, not 34.** 34 is not a token step; snapped to the nearest real one, `Space/800`.',
          "- **The scrim is painted on the bottom region, not pinned at 151px.** Figma draws a 390×151 gradient rectangle from transparent to `background/page`, ending exactly where `bottomContent` begins. 151 is not a token, so the gradient is painted on the action row and extended above it by its own height — same effect, no invented value.",
          '- **No fixed 390px width.** Nothing in tokens.json holds 390: `Responsive/Device Width` is 1200 / 768 / 375. The shell fills its container instead.',
        ].join('\n'),
      },
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * All three regions filled, with the pieces a recall screen actually uses:
 * the recall header on top, copy in the middle, one action at the bottom.
 */
export const AllThreeRegions: Story = {
  name: 'All three regions',
  args: {
    top: (
      <AppBar
        variant="leftAndRightButton"
        leftIcon={<CloseIcon />}
        leftLabel="Close"
        rightCTA="Skip"
        onLeftClick={fn()}
        onRightCTAClick={fn()}
      >
        <ProgressIndicator
          variant="Primary"
          thickness="16"
          progress="50"
          aria-label="Recall progress"
        />
      </AppBar>
    ),
    children: (
      <div style={{ padding: 'var(--dimension-space-600)' }}>
        <TextBlock
          variant="M"
          title="The content region takes whatever height is left and scrolls when it outgrows it."
          showCaption={false}
        />
      </div>
    ),
    bottom: <Button variant="Primary" size="L" CTA="Next question" onClick={fn()} />,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Next question' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeVisible();
  },
};

/**
 * Content only. Both pinned regions are optional and collapse out of the
 * layout entirely when nothing is passed — a screen with no header and no
 * action row keeps the full middle.
 */
export const ContentOnly: Story = {
  name: 'Content only',
  args: {
    children: (
      <div style={{ padding: 'var(--dimension-space-600)' }}>
        <TextBlock
          variant="L"
          title="No header, no action"
          caption="Both pinned regions collapse when nothing is passed."
        />
      </div>
    ),
  },
};

/**
 * The case the scrim exists for: content taller than the middle region scrolls
 * under the action row and fades into the page rather than colliding with the
 * button.
 */
export const ContentScrollsUnderTheScrim: Story = {
  name: 'Content scrolls under the scrim',
  args: {
    top: (
      <AppBar
        variant="leftAndRightButton"
        leftIcon={<CloseIcon />}
        leftLabel="Close"
        rightCTA="Skip"
        onLeftClick={fn()}
        onRightCTAClick={fn()}
      >
        <ProgressIndicator
          variant="Primary"
          thickness="16"
          progress="75"
          aria-label="Recall progress"
        />
      </AppBar>
    ),
    children: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--dimension-space-400)',
          padding: 'var(--dimension-space-600)',
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <TextBlock
            key={i}
            variant="M"
            title={`Paragraph ${i + 1}`}
            caption="Enough copy to push the middle region past the height it has."
          />
        ))}
      </div>
    ),
    bottom: <Button variant="Primary" size="L" CTA="Next question" onClick={fn()} />,
  },
};
