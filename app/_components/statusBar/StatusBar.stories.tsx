import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { StatusBar } from './StatusBar';

const meta = {
  title: 'Components/statusBar',
  component: StatusBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '### What it is',
          '',
          'The iOS status bar: clock on the left, signal, wi-fi and battery on the right.',
          '',
          '**USE:** at the top of `Screen`, which reserves the region for it and renders it automatically.',
          '',
          "**DON'T:** read anything into it. It is device chrome, drawn so a 390×844 screenshot looks like a phone rather than a browser tab — nothing here reports real signal, real charge or the real time.",
          '',
          '### Why it exists now',
          '',
          'It was deliberately *not* built at first: Figma composes a `Status Bar` instance from an external library into every screen, and drawing fake OS chrome seemed like the wrong call for a design prototype. It was logged as a gap with a note — *"revisit if a screenshot ever needs to look like a real phone"*. It did.',
          '',
          '### Accessibility',
          '',
          '`aria-hidden` on the whole thing. A screen reader announcing a fake battery level would be worse than silence.',
          '',
          '### Departures from Figma',
          '',
          "- **Redrawn, not instantiated.** The `Status Bar` in the file comes from an external library with no React build, so this reproduces its geometry: clock at `Space/600` from the left, glyphs `Space/150` apart and `Space/400` from the right.",
          '- **Glyphs are 12px, not 11.** 11 is not a token step; snapped to `Icon/150`, with each viewBox keeping its own aspect ratio.',
          '- **Wi-fi is drawn as arcs, not filled wedges.** At 12px the stroke reads more clearly than the solid form.',
          '- **The battery is always full.** There is no battery to report.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As every screen carries it: 09:41, the time Apple has used since 2007. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('09:41')).toBeVisible();
  },
};

/** A different clock, for a screenshot that needs one. */
export const CustomTime: Story = {
  name: 'A different time',
  args: { time: '14:08' },
};
