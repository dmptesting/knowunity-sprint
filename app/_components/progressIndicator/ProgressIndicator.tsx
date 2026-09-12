import type { HTMLAttributes } from 'react';
import styles from './ProgressIndicator.module.css';

/** Figma variant property `variant`. */
export type ProgressIndicatorVariant = 'Primary' | 'Coral';
/** Figma variant property `thickness`. Kept as strings, exactly as Figma names the options. */
export type ProgressIndicatorThickness = '24' | '16';
/** Figma variant property `progress`. Five fixed steps, never a free percentage. */
export type ProgressIndicatorProgress = '0' | '25' | '50' | '75' | '100';

const VARIANT_CLASS: Record<ProgressIndicatorVariant, string> = {
  Primary: styles.variantPrimary,
  Coral: styles.variantCoral,
};

const THICKNESS_CLASS: Record<ProgressIndicatorThickness, string> = {
  '24': styles.thickness24,
  '16': styles.thickness16,
};

const PROGRESS_CLASS: Record<ProgressIndicatorProgress, string> = {
  '0': styles.progress0,
  '25': styles.progress25,
  '50': styles.progress50,
  '75': styles.progress75,
  '100': styles.progress100,
};

/**
 * What the centred count sits on at each step. Figma draws it in one near-white
 * ink, which fails contrast over the fill, so the count takes the track's ink
 * over the track and the fill's paired onBold ink over the fill. At 50 it
 * straddles the fill's edge and is drawn in both, split at that edge.
 */
const COUNT_BACKDROP: Record<ProgressIndicatorProgress, 'track' | 'fill' | 'split'> = {
  '0': 'track',
  '25': 'track',
  '50': 'split',
  '75': 'fill',
  '100': 'fill',
};

export type ProgressIndicatorProps = {
  /** Figma variant `variant`. */
  variant?: ProgressIndicatorVariant;
  /** Figma variant `thickness`. */
  thickness?: ProgressIndicatorThickness;
  /** Figma variant `progress`. */
  progress?: ProgressIndicatorProgress;
  /**
   * Figma property `showText`. Only has an effect at thickness `24` — Figma's
   * Unit Progress layer doesn't exist in the thickness `16` variants.
   */
  showText?: boolean;
  /**
   * The step count shown when `showText` is on, e.g. "2/4". Figma's Unit
   * Progress is a plain text layer rather than an exposed component property,
   * so this has no Figma name to match and no default — the bar should never
   * render placeholder copy like Figma's "0/12".
   */
  unitProgress?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * Stepped progress against a fixed count of steps (e.g. a 12-step lesson), not
 * a free percentage.
 *
 * Don't treat progress as continuous; it only has 5 steps.
 *
 * Give it an `aria-label` naming what is progressing — a progressbar needs an
 * accessible name, and only the caller knows what it measures.
 */
export function ProgressIndicator({
  variant = 'Primary',
  thickness = '24',
  progress = '0',
  showText = false,
  unitProgress,
  className,
  ...rest
}: ProgressIndicatorProps) {
  const backdrop = COUNT_BACKDROP[progress];
  const classes = [
    styles.progressIndicator,
    VARIANT_CLASS[variant],
    THICKNESS_CLASS[thickness],
    PROGRESS_CLASS[progress],
    backdrop === 'split' ? styles.countSplit : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textVisible = showText && thickness === '24' && Boolean(unitProgress);

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Number(progress)}
      aria-valuetext={unitProgress}
      {...rest}
    >
      <div className={styles.container}>
        <div className={styles.progress} />
      </div>

      {/* Already announced through aria-valuetext, so hidden here to avoid
          screen readers reading the count twice. Each ink sits in a wrapper
          that crops it to its own side of the fill's edge; only the inks the
          count actually sits on are drawn at all. */}
      {textVisible && backdrop !== 'fill' ? (
        <span className={styles.countOnTrack} aria-hidden="true">
          <span className={styles.unitProgress}>{unitProgress}</span>
        </span>
      ) : null}
      {textVisible && backdrop !== 'track' ? (
        <span className={styles.countOnFill} aria-hidden="true">
          <span className={styles.unitProgress}>{unitProgress}</span>
        </span>
      ) : null}
    </div>
  );
}
