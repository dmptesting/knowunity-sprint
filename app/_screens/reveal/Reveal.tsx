'use client';

import { Screen } from '../../_components/screen/Screen';
import { AppBar } from '../../_components/appBar/AppBar';
import { Button } from '../../_components/button/Button';
import { CloseIcon } from '../../_components/icons/UiIcons';
import {
  Spotlight,
  type SpotlightSize,
} from '../../_components/spotlight/Spotlight';

export type RevealProps = {
  /** The question's answer, the one thing this screen exists to show. */
  answer: string;
  /**
   * Advance to the next question. Both the close button and "next question"
   * call it — the question is over, so there is one way out and it is forward.
   */
  onNext?: () => void;
};

/**
 * How big the answer is set, by how long it is. The label above stays at
 * Headline S, the hint overlay's label size; only the answer steps down, so a
 * short answer is as loud as possible and a paragraph still fits without
 * scrolling.
 *
 * Breakpoints are characters, measured against the script's answers at 390px:
 * each step is the longest copy that style holds in the content region with
 * room to spare.
 */
export function answerSize(answer: string): SpotlightSize {
  const length = answer.length;
  if (length <= 60) return 'XL';
  if (length <= 110) return 'L';
  if (length <= 160) return 'M';
  return 'S';
}

/**
 * Reveal — the answer page at the end of the hint ladder.
 *
 * Reached only from the reveal sheet, which rises when both hints are spent
 * and the student still missed. Never by skipping: a skipped question moves
 * straight on and shows no answer. The question scores zero XP.
 *
 * Laid out like the hint overlay — close, the label and the answer large and
 * centred, one primary action — so the two moments where the screen hands the
 * student a piece of information read the same way. No Knowie and no bubble:
 * the answer is the page's whole voice.
 */
export function Reveal({ answer, onNext }: RevealProps) {
  return (
    <Screen
      top={
        <AppBar
          variant="leftIconButtonOnly"
          leftIcon={<CloseIcon />}
          leftLabel="Close answer"
          onLeftClick={onNext}
        />
      }
      bottom={<Button variant="Primary" size="L" CTA="Next question" onClick={onNext} />}
    >
      <Spotlight
        label="Answer"
        labelSize="L"
        body={answer}
        size={answerSize(answer)}
        focusOnMount
      />
    </Screen>
  );
}
