import { PROGRESS_ACTIVITY_PATH, SQUARE_PATH, VIEW_BOX } from '../icons/paths';

/**
 * The two glyphs the button draws, from Material Symbols (rounded), replacing
 * the vectors previously exported from Figma.
 *
 * Material's 960 grid centres and optically pads each glyph, so both simply
 * fill their icon box — unlike the Figma exports, which each needed their own
 * translate. Figma bakes a literal fill into its icon components; these use
 * `currentColor` so the glyph inherits the button's own token-bound label
 * colour rather than carrying a hardcoded hex.
 */

type IconProps = {
  /** Rendered box, always one of the `--dimension-icon-*` tokens. */
  size: string;
};

function Glyph({ size, d }: IconProps & { d: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/**
 * Material Symbols `square` — the placeholder that stands in for a real icon,
 * the same role Figma's `square` played as the default instance swap. Still a
 * placeholder: never ship it as real content.
 */
export function SquareIcon({ size }: IconProps) {
  return <Glyph size={size} d={SQUARE_PATH} />;
}

/** Material Symbols `progress_activity` — shown for state=Loading. */
export function LoadingIcon({ size }: IconProps) {
  return <Glyph size={size} d={PROGRESS_ACTIVITY_PATH} />;
}
