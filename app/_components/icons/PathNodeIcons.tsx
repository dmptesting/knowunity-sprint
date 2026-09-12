import { QUIZ_PATH, MIC_PATH, VIEW_BOX } from './paths';

/**
 * The two glyphs pathNode swaps into its Marker's iconSlot, from Material
 * Symbols (rounded) — one per `format`.
 *
 * There is no check-circle here any more: `completed` shows its own format
 * icon like every other progress state, so the icon always says what the step
 * is and the marker fill alone says how far along you are.
 *
 * Both share Material's 960 grid, so each renders at a consistent optical size
 * inside the Icon/300 slot. Colour comes from `currentColor` so it stays bound
 * on the parent.
 */

const SVG = {
  width: '100%',
  height: '100%',
  viewBox: VIEW_BOX,
  fill: 'none',
  'aria-hidden': true,
  focusable: 'false',
} as const;

/** Material Symbols `quiz` — pathNode's `format=quiz` marker. */
export function AiQuizIcon() {
  return (
    <svg {...SVG}>
      <path d={QUIZ_PATH} fill="currentColor" />
    </svg>
  );
}

/** Material Symbols `mic` — pathNode's `format=explainOutLoud` marker. */
export function MicIcon() {
  return (
    <svg {...SVG}>
      <path d={MIC_PATH} fill="currentColor" />
    </svg>
  );
}
