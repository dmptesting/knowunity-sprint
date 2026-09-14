/*
 * The abandon sheet's eight reasons, in Figma screen 10's order.
 *
 * Three of them say the same thing in different words: the voice path is the
 * problem, not the recall. Selecting any of those swaps the sheet's primary
 * action from "keep reviewing" to "switch to typing", so the student is
 * offered the thing that would actually help rather than being asked again to
 * do what they just said they could not.
 */

export type AbandonReason = {
  id: string;
  label: string;
  /** Selecting this offers text instead of asking them to carry on. */
  offersTyping: boolean;
};

export const ABANDON_REASONS: AbandonReason[] = [
  { id: 'confusing', label: "I don't understand how this works", offersTyping: false },
  {
    id: 'mic',
    label: "Something didn't work right (mic / it couldn't hear me)",
    offersTyping: true,
  },
  {
    id: 'cannot-speak',
    label: "I can't speak out loud right now (I'm around people / in public)",
    offersTyping: true,
  },
  { id: 'bad-question', label: 'The question was bad', offersTyping: false },
  { id: 'awkward', label: 'I feel awkward talking to the app', offersTyping: false },
  { id: 'prefers-text', label: "I'd rather type than talk", offersTyping: true },
  { id: 'just-looking', label: 'I was just checking how it looks', offersTyping: false },
  { id: 'other', label: 'Other', offersTyping: false },
];

/** Whether the reasons picked so far are ones typing would solve. */
export function offersTyping(selected: readonly string[]): boolean {
  return ABANDON_REASONS.some((r) => r.offersTyping && selected.includes(r.id));
}
