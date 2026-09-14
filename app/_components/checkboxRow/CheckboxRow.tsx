'use client';

import type { LabelHTMLAttributes } from 'react';
import styles from './CheckboxRow.module.css';
import { Checkbox } from '../checkbox/Checkbox';

export type CheckboxRowProps = {
  /** The visible text. It names the control, so it is required. */
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
} & Omit<LabelHTMLAttributes<HTMLLabelElement>, 'children' | 'onChange'>;

/**
 * A checkbox with its text beside it: label on the left, box on the right.
 *
 * USE: (unverified) any list of options the student picks from — the abandon
 * sheet's reasons, the primer's tap-mode toggle.
 *
 * DON'T: (unverified) don't pair it with a second label elsewhere on the row.
 * The row's own text is the control's accessible name, and naming it twice is
 * worse than not naming it at all.
 *
 * `checkbox` is the box alone — Figma gives it no label layer, and its docs say
 * so: "Figma's component is the box alone, with no label layer, so nothing in
 * the design names it." Every real usage therefore has to supply the text, and
 * the whole row has to be the hit target. This is that pairing, built once.
 *
 * The `<label>` wraps both, so tapping the text toggles the box and the row is
 * one target rather than a 24px one. `aria-label={undefined}` on the box stops
 * the name being announced twice.
 */
export function CheckboxRow({
  label,
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  ...rest
}: CheckboxRowProps) {
  const classes = [styles.checkboxRow, className].filter(Boolean).join(' ');

  return (
    <label className={classes} {...rest}>
      <span className={styles.label}>{label}</span>
      <Checkbox
        selection={checked ? 'Selected' : 'Unselected'}
        state={disabled ? 'Disabled' : 'Default'}
        label={label}
        aria-label={undefined}
        onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
      />
    </label>
  );
}
