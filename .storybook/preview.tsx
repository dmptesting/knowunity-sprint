import type { Preview } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import './preview.css'
import { docsTheme } from './theme'

// This prototype is fixed at the iPhone 12/13/14 width (390px) — see CLAUDE.md.
const MOBILE_VIEWPORT = 'iphone12'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    // Dark mode only: theme the Docs page chrome itself, not just our content,
    // so documentation text isn't rendered against Storybook's default light background.
    docs: {
      theme: docsTheme,
    },

    // Dark mode only, no toggle: tokens.css has one (dark) palette, applied in preview.css.
    backgrounds: { disable: true },

    // Component stories default to the prototype's fixed mobile width.
    // Docs/MDX pages aren't wrapped in this viewport frame, so they keep full width.
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  initialGlobals: {
    viewport: { value: MOBILE_VIEWPORT },
  },
};

export default preview;