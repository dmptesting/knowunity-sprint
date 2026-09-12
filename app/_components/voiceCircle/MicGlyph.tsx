import { MIC_PATH, VIEW_BOX } from '../icons/paths';

/**
 * The mic glyph inside voiceCircle's `mode=idle` variant — Material Symbols
 * `mic` (rounded), replacing the vector previously exported from Figma.
 *
 * design-system.md flags this slot as a disclosed exception: inside voiceCircle
 * the mic is a plain vector rather than a nested iconSlot instance, because no
 * mic icon existed in the library when the circle was built. That still holds;
 * only the artwork has changed.
 *
 * The path data lives in ../icons/paths.ts because pathNode's explainOutLoud
 * marker draws the same glyph. Material's grid centres and pads the glyph
 * itself, so it simply fills the 40x40 `Icon` frame (Illustration/500) with no
 * per-icon translate. Figma bakes in accent/brand/onBold; this uses
 * `currentColor` so the colour stays bound on the parent.
 */
export function MicGlyph() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={VIEW_BOX}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={MIC_PATH} fill="currentColor" />
    </svg>
  );
}
