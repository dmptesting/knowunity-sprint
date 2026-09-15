'use client';

import { useEffect, useRef } from 'react';
import {
  BottomSheet,
  type BottomSheetProps,
} from '../../_components/bottomSheet/BottomSheet';
import styles from './ResultSheet.module.css';

/**
 * Exactly `bottomSheet`'s props, passed straight through — the copy, the
 * result and the handlers are all decided by the session, not here.
 */
export type ResultSheetProps = BottomSheetProps;

/**
 * Any sheet that rises over the turn: a checked answer (`correct`,
 * `incorrect`), a recording too fuzzy to judge (`unsure`), or the end of the
 * hint ladder (`reveal`).
 *
 * The turn stays where it is — Knowie, the question, the circle — and
 * `bottomSheet` rises over its lower half, so the student reads the sheet
 * against the question it is about rather than on a page that has forgotten it.
 *
 * `bottomSheet` paints the panel only: a 376px section with no position, no
 * scrim and no motion of its own. This is everything around it — the anchor
 * to the bottom of the phone, the slide, the dialog semantics and the focus.
 *
 * **No scrim.** The question has to stay readable behind the sheet; that is
 * the point of not leaving the screen.
 *
 * **Not modal.** The question body underneath is locked while the sheet is up,
 * but the header is not: close stays live, and so does skip wherever the sheet
 * does not offer its own. That is why there is no `aria-modal` — it would tell
 * assistive tech the header was unavailable when it isn't.
 */
export function ResultSheet(props: ResultSheetProps) {
  const sheet = useRef<HTMLDivElement>(null);

  // The sheet arrived without the student's focus moving, so move it —
  // otherwise a screen reader is still sitting on the circle underneath.
  //
  // `preventScroll` matters here: the sheet is `position: absolute` and
  // still sliding up from `translateY(100%)` when this runs. Without it,
  // the browser's default focus behaviour scrolls the nearest scroll
  // container into view to reveal the not-yet-arrived element — `body`
  // still counts as one even with `overflow: hidden` — which reads as the
  // whole page lurching instead of the sheet alone gliding up.
  useEffect(() => {
    sheet.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={sheet}
      className={styles.resultSheet}
      role="dialog"
      aria-label={props.title}
      tabIndex={-1}
    >
      <BottomSheet {...props} />
    </div>
  );
}
