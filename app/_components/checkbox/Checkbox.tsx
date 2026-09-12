'use client';

import type { InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';
import { CheckIcon } from '../icons/UiIcons';

/** Figma variant property `Selection`. */
export type CheckboxSelection = 'Unselected' | 'Selected';
/** Figma variant property `State`. */
export type CheckboxState = 'Default' | 'Error' | 'Disabled';

const SELECTION_CLASS: Record<CheckboxSelection, string> = {
  Unselected: styles.unselected,
  Selected: styles.selected,
};

const STATE_CLASS: Record<CheckboxState, string> = {
  Default: styles.stateDefault,
  Error: styles.stateError,
  Disabled: styles.stateDisabled,
};

export type CheckboxProps = {
  /** Figma variant `Selection`. */
  selection?: CheckboxSelection;
  /** Figma variant `State`. */
  state?: CheckboxState;
  /**
   * The control's accessible name, e.g. "I'd rather type than talk". Required:
   * Figma's component is the box alone, with no label layer, so nothing in the
   * design names it.
   */
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'disabled'>;

/**
 * Selection control. Check/uncheck for lists, onboarding checklists,
 * multi-select, T&C acceptance.
 *
 * The visible box is decoration over a real checkbox input, so it keeps native
 * keyboard and screen-reader behaviour.
 */
export function Checkbox({
  selection = 'Unselected',
  state = 'Default',
  label,
  className,
  onChange,
  ...rest
}: CheckboxProps) {
  const classes = [
    styles.checkbox,
    SELECTION_CLASS[selection],
    STATE_CLASS[state],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      <input
        type="checkbox"
        className={styles.input}
        checked={selection === 'Selected'}
        disabled={state === 'Disabled'}
        aria-invalid={state === 'Error' || undefined}
        aria-label={label}
        onChange={onChange}
        // `selection` owns the checked state, so without a handler this is a
        // read-only control — said explicitly, rather than leaving React to
        // warn about a checked field that can never change.
        readOnly={!onChange}
        {...rest}
      />
      {/* Figma's "Box", holding the check glyph through an iconSlot. The input
          above carries the state, so the drawing is hidden from assistive tech. */}
      <span className={styles.box} aria-hidden="true">
        {selection === 'Selected' ? (
          <span className={styles.icon}>
            <CheckIcon />
          </span>
        ) : null}
      </span>
    </span>
  );
}
