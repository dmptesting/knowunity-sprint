import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Screen.module.css';

export type ScreenProps = {
  /**
   * Figma's `topNavigation` region — the appBar, pinned to the top and never
   * scrolling.
   */
  top?: ReactNode;
  /**
   * Figma's `middleContent` region — everything between the nav and the action
   * row. Scrolls when it outgrows the space, fading out under the scrim.
   */
  children?: ReactNode;
  /**
   * Figma's `bottomContent` region — the action row, pinned above the home
   * indicator. Sits on the scrim, so content scrolling underneath fades into
   * the page rather than colliding with the button.
   */
  bottom?: ReactNode;
  /**
   * Makes the content and action regions inert while leaving `top` live — for
   * a sheet laid over the lower screen. The header is the persistent way out
   * (close, skip), and a sheet over the body must never take it away.
   */
  lockBody?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'>;

/**
 * The phone-frame shell every recall screen composes inside: a pinned top
 * region, a scrolling content region, and a pinned bottom action region above
 * the home indicator.
 *
 * USE: (unverified) as the outermost element of any screen in this prototype.
 *
 * DON'T: (unverified) don't give it a width. It fills its container, and the
 * container is the phone — 390px in Storybook's viewport and under `next dev`
 * on a handset.
 *
 * Figma composes every flow screen out of loose `Panel Header` / `topNavigation`
 * / `bottomContent` / `bottomSheetOnly` frames plus a `Status Bar` instance,
 * but there is no `scaffold` component in the file and design-system.md does
 * not document one — so this is that arrangement read off screens 03, 06 and
 * 07 and built as a component, per SPEC.md Step 0a.
 */
export function Screen({
  top,
  children,
  bottom,
  lockBody = false,
  className,
  ...rest
}: ScreenProps) {
  // `inert` rather than pointer-events: it also removes the regions from the
  // tab order and the accessibility tree, so a keyboard can't reach under a
  // sheet either. `undefined` rather than `false` keeps the attribute off.
  const locked = lockBody || undefined;

  const classes = [styles.screen, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {top ? <div className={styles.top}>{top}</div> : null}

      <main className={styles.content} inert={locked}>
        {children}
      </main>

      {bottom ? (
        <div className={styles.bottom} inert={locked}>
          {bottom}
        </div>
      ) : null}

      {/*
        Figma's "bottomContent" / "bottomSheetOnly" frames: the 34px home
        indicator strip at the foot of every screen. Reserved, not drawn.
      */}
      <div className={styles.homeIndicator} aria-hidden="true" />
    </div>
  );
}
