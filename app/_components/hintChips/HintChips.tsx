'use client';

import { Chips, type ChipsColor } from '../chips/Chips';

/** Same fill for every hint tier — the label, not the colour, tells them apart. */
const TIER_COLOR: ChipsColor[] = ['magenta', 'magenta'];

export type HintChipsProps = {
  /** The hints spent on this question, in order. Renders nothing when empty. */
  hints: readonly string[];
  /** Reopen a hint, by its position in `hints`. */
  onOpen?: (index: number) => void;
};

/**
 * The spent hints, as chips — both in `accent/magenta/bold` — each reopening
 * its own hint overlay.
 *
 * USE: (unverified) under Knowie's question on a turn, via knowieSays'
 * attachment row, once a hint has been spent.
 *
 * DON'T: (unverified) don't show the hint text itself. The chip is the way
 * back to it; the overlay is where it is read.
 *
 * Replaces the `hintCard` that used to sit on the turn. The card kept the hint
 * visible while the student re-recorded; the chip keeps it one tap away
 * instead, for a cleaner turn. Both tiers stay reachable once paid for — a
 * student who has seen hint 2 may still want hint 1, and both cost XP.
 */
export function HintChips({ hints, onOpen }: HintChipsProps) {
  if (hints.length === 0) return null;

  return (
    <>
      {hints.map((hint, index) => (
        <Chips
          key={index}
          size="S"
          color={TIER_COLOR[index] ?? 'magenta'}
          active
          Text={`Hint ${index + 1}`}
          showLeftIcon={false}
          showRightIcon={false}
          aria-label={`Hint ${index + 1}: ${hint}`}
          onClick={() => onOpen?.(index)}
        />
      ))}
    </>
  );
}
