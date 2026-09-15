'use client';

import { useEffect } from 'react';

/**
 * Keeps `--app-height` in sync with `window.visualViewport`'s real height,
 * for `globals.css`'s `body` to size against instead of `100dvh`.
 *
 * `layout.tsx`'s `interactiveWidget: 'resizes-content'` handles this on iOS
 * 17.4+ and recent Chrome by shrinking the *layout* viewport itself when the
 * keyboard opens. Older browsers ignore that hint: only the *visual*
 * viewport shrinks, the layout viewport `100dvh` measures stays tall, and
 * the OS auto-scrolls (pans) it to keep the focused input above the
 * keyboard — dragging everything above it (the mascot, his bubble, the
 * header) off the top of the screen along with it.
 *
 * Sizing `body` to `visualViewport.height` directly removes the mismatch
 * that pan exists to compensate for: once the page is exactly as tall as
 * what is actually visible, there is nothing left above the keyboard for
 * the OS to scroll to reveal.
 */
export function useViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const sync = () => {
      document.documentElement.style.setProperty('--app-height', `${viewport.height}px`);
    };

    sync();
    viewport.addEventListener('resize', sync);
    return () => viewport.removeEventListener('resize', sync);
  }, []);
}
