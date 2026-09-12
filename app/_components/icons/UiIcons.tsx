import {
  ADD_PATH,
  ARROW_BACK_PATH,
  CHECK_PATH,
  CLOSE_PATH,
  IOS_SHARE_PATH,
  MORE_VERT_PATH,
  SEND_PATH,
  MIC_PATH,
  VIEW_BOX,
} from './paths';

/**
 * The glyphs the interface components swap into an iconSlot, from Material
 * Symbols (rounded) — the same source and 960 grid as the button and pathNode
 * icons, so everything stays optically consistent.
 *
 * Figma bakes a literal fill into each icon component; these use
 * `currentColor`, so the glyph inherits whichever token-bound colour its parent
 * sets. That is what design-system.md's "new icons carry their own default
 * fill" rule amounts to in code: the parent owns the colour, and it is always a
 * token.
 *
 * `size` is optional: omitted, the glyph fills its slot, which is how pathNode
 * uses its icons. Passed, it must be a `--dimension-icon-*` token, which is how
 * the button sizes its own.
 */

type IconProps = {
  /** Rendered box. Always a `--dimension-icon-*` token; omit to fill the slot. */
  size?: string;
};

function Glyph({ size, d }: IconProps & { d: string }) {
  return (
    <svg
      width={size ?? '100%'}
      height={size ?? '100%'}
      viewBox={VIEW_BOX}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** Material Symbols `add` — chatInput's attach action (Figma's `plus`). */
export function AddIcon({ size }: IconProps) {
  return <Glyph size={size} d={ADD_PATH} />;
}

/**
 * Material Symbols `close` — the file's `x-close`. Dismiss, never back:
 * "arrow-left is the icon for that, this one always means dismiss."
 */
export function CloseIcon({ size }: IconProps) {
  return <Glyph size={size} d={CLOSE_PATH} />;
}

/** Material Symbols `send` — chatInput's explicit send (Figma's `send-03`). */
export function SendIcon({ size }: IconProps) {
  return <Glyph size={size} d={SEND_PATH} />;
}

/** Material Symbols `check` — the checkbox's Selected glyph. */
export function CheckIcon({ size }: IconProps) {
  return <Glyph size={size} d={CHECK_PATH} />;
}

/**
 * Material Symbols `mic` — the file's `mic` icon. Same glyph pathNode and
 * voiceCircle draw, re-exported here so chatInput can reach it without
 * importing another component's icon module.
 */
export function MicIcon({ size }: IconProps) {
  return <Glyph size={size} d={MIC_PATH} />;
}

/**
 * Material Symbols `arrow_back` — the file's `arrow-left`, appBar's leading
 * action. Back navigation only: `x-close` is the icon for dismiss.
 */
export function ArrowBackIcon({ size }: IconProps) {
  return <Glyph size={size} d={ARROW_BACK_PATH} />;
}

/** Material Symbols `more_vert` — the file's `dots-vertical`, appBar's overflow action. */
export function MoreVertIcon({ size }: IconProps) {
  return <Glyph size={size} d={MORE_VERT_PATH} />;
}

/** Material Symbols `ios_share` — the file's `share-02`, appBar's share action. */
export function ShareIcon({ size }: IconProps) {
  return <Glyph size={size} d={IOS_SHARE_PATH} />;
}
