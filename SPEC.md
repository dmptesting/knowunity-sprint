# Voice recall — build spec

A 4-question voice active-recall step: the student explains a concept out loud, Knowie
judges it in text, with a two-tier hint ladder before reveal and a summary that reflects
hint use in XP.

This spec covers the 10 states missing from the current build. Recall, speech-to-text and
judging are mocked; the interaction, states and transitions are real.

---

## Screen list, in build order

Foundations come first — every screen below reads from them.

**Step 0 — foundations (not screens)**

- `app/_recall/script.ts` — the 4 questions: prompt, answer, two hints, verdict sequence,
  canned transcripts.
- `app/_recall/useRecallSession.ts` — turn phase, ladder position, XP, pausable timer,
  voice/text mode, permission status.
- `app/_recall/usePushToTalk.ts` — hold, slide-to-cancel arming, tap-mode alternative.
  Nothing here detects when speech stops.
- Read `node_modules/next/dist/docs/01-app` before creating any route (AGENTS.md).

Then, easiest first:

| # | Screen / state | Why it's here |
|---|---|---|
| 1 | Reveal | Static panel, one action |
| 2 | Result: fail | Copy variant of the partial panel already drawn on Figma 07 |
| 3 | Entry + mic primer | Extends Figma 02; one action, triggers the real permission prompt |
| 4 | Permission denied → text | Static panel that routes into the text path |
| 5 | Skip | One `Button`, plus a transition |
| 6 | Text fallback turn | `ChatInput` is already complete; the work is session-sticky mode |
| 7 | Status notices (4 If-time states) | One shared notice region, four copy sets |
| 8 | Cancel & re-record | Hardest: pointer gesture, arming, three-phase hint line, reduced motion |

---

## Per screen

### 1. Reveal

**States:** one.

**Components:** `AppBar` (`variant="leftAndRightIconButton"`, `ProgressIndicator` as its
child), `MascotSlot` (`size="2XL"`), `CalloutBubble`, `Button` (`variant="Primary"`).

**Student can:** read the answer, tap "next question". Scores zero XP.
Reached only by exhausting the ladder — never by skipping.

### 2. Result: fail

**States:** two — fail, and partial (already drawn, same structure, different copy).

**Components:** `AppBar` + `ProgressIndicator`, `CalloutBubble` for the transcript,
`ButtonGroup` (`variant="Vertical"`, `primaryCTA` / `secondaryCTA`).

**Student can:** read what was heard and the feedback, then "try again" or "view hint".
Partial acknowledges what was right; fail stays encouraging without inventing credit.
Same components, same layout — the distinction is copy only.

### 3. Entry + mic primer

**States:** one. Extends Figma screen 02.

**Components:** `MascotSlot` (`size="3XL"`), `CalloutBubble`, `Button` (`variant="Primary"`).

**Student can:** read why the mic is needed and what happens, then tap "let's get started",
which fires the real browser `getUserMedia` prompt. A text escape is present here too.

### 4. Permission denied → text

**States:** one.

**Components:** `MascotSlot`, `CalloutBubble`, `ButtonGroup` (`variant="Vertical"`).

**Student can:** see what they're missing and how to re-enable it, and continue in text —
the session switches to text mode and carries on. Never a dead end.

### 5. Skip

**States:** none of its own — a `Button` (`variant="Tertiary"`) under the circle, beside
"type instead", present on every question from idle.

**Student can:** skip at any point. Moves straight to the next question. No answer shown,
zero XP.

`ButtonGroup` holds exactly two actions, so skip and "type instead" are two separate
Tertiary `Button`s, not a group.

### 6. Text fallback turn

**States:** `ChatInput` statuses `Inactive`, `Typing`, `Ready to send`, `Loading`.

**Components:** `ChatInput` (`status`, `value`, `label`, `onSend`), `AppBar` +
`ProgressIndicator`, `CalloutBubble` for the question.

**Student can:** type an answer and send it explicitly; get the same verdicts, the same
ladder and the same XP as a spoken answer. Text is sticky for the rest of the session,
with a persistent mic control to return to voice.

### 7. Status notices — empty, garbled, timeout, network

**States:** four, one shared region.

**Components:** `CalloutBubble` or a token-bound text region, `Button`
(`variant="Secondary"`) for retry. Composed from `accent/brand/subtle` and
`text/secondary` — no new tokens.

**Student can:**

- *Empty / garbled:* "didn't catch that" → retry. **Free — the ladder is not charged.**
- *Timeout:* copy softens at 4s, retry offered at 8s. The processing state holds, never errors out.
- *Network:* progress and XP are kept; on return the same question reopens at idle and the
  in-flight attempt is discarded.

### 8. Cancel & re-record

**States:** three phases of one recording state — holding, armed-to-cancel, released.

**Components:** `VoiceCircle` (`mode="recording"`), plus the hint line above it.

**Student can:** hold to speak, slide off the circle to arm cancel, release to discard
instead of send. Taught by the hint line, which reads "hold to speak" → "release to send ·
slide up to cancel" → "release to cancel" when armed.

**Accessible alternative:** tap-to-start / tap-to-send, automatic under assistive tech plus
a manual toggle. Still fully explicit send — nothing detects when speaking stops.

### Also changing

**Abandon sheet** (Figma 10) — `Checkbox` ×8 + `ButtonGroup`. Selecting "mic didn't work",
"can't speak out loud right now" or "I'd rather type" reveals a "switch to typing instead"
option. "Leave anyway" stays primary and one tap.

**Summary** (Figma 09) — `StatTile` ×3 + `Button`. Reads `x/4`, not `x/5`. Timer is real
elapsed with processing and hint-reading paused out.

**Path node** — `PathNode` becomes `progress="completed"` only if at least one question passed.

---

## How the mocked recall behaves

- **Verdicts are scripted per question.** Each question carries a fixed sequence. The mock
  ignores what the student actually says.
- **Every verdict ships a canned transcript**, shown on all result states. The partial one
  is deliberately half-right, the fail one visibly garbled — so a miss reads as "it
  misheard me", not "I failed".
- **Processing is a fixed ~2s delay.** Long enough to evaluate the state, short enough to
  click through.
- **A hidden dev control forces any verdict**, for demoing states without playing the ladder.
  Not reachable in the normal flow.
- **Replay is identical** — same questions, same script, every run. A student who returns
  and answers correctly can still be told they missed it. Accepted prototype limitation.
- **Empty and garbled are scripted too**, not detected from audio.

---

## Out of scope

From `sprint-context.md`: real speech-to-text, real judging, auto-endpointing, the optional
"say it back" repeat step, conversation branching on off-topic speech.

From the Voice UX Reference's triage: mic hardware busy, student switches language
mid-answer, pause/resume into one take.

Decided in this spec: Knowie never speaks or emits audio. No new components and no new
tokens — no `feedback/*` family is added. No new Figma screens; the design file gets three
surgical fixes only (screen 09's `4/5` → `4/4`; screens 03/04/05 rebound from the local
`Voice circle (invented)` set, node `13543:10832`, to the documented `voiceCircle` set,
node `13558:14306`; screen 07's "Try Again"/"View Hint" to sentence case). The auto-chain
entry after the last quiz is not modelled — node tap only.

---

## Open

Still undecided; these need an answer before the screens they affect can be built.

1. **The 4 questions themselves.** Only one exists ("What makes a password resistant to
   brute-force attacks?", Figma 03). Three more prompts, answers and hint pairs are unwritten.
2. **The scripted verdict sequence per question** — which question passes first try, which
   goes partial, which rides the ladder to reveal, which carries the empty/garbled state.
3. **Canned transcript copy** for each verdict, including a convincing half-right partial
   and a plausibly garbled fail.
4. **Which `MascotSlot` expression** goes on pass, fail and reveal. `expression` accepts 14;
   only `standby` has real shipped usage, and `design-system.md` says to treat the rest as
   unverified. Candidates discussed: `approving` or `excited` on pass, `determined` or
   `thinking` on reveal. `sad` was ruled out — it reads as disappointment in the student.
5. **Where the tap-mode toggle lives** — in the primer, in the `AppBar`, or both.
6. **The dev control's affordance** — query param, long-press, or both.
7. **How "switch to typing" fits the abandon sheet.** `ButtonGroup` holds exactly two
   actions and the sheet already uses both.
8. **Slide-to-cancel direction** — up only, or any direction off the circle.
9. **Whether timeout and network states are reachable outside the dev control**, given a
   fixed 2s mock judge and no real network.
10. **Whether skip should instead live in `AppBar`.** `variant="leftAndRightButton"` is
    documented as "the skip escape hatch: a text action on the right", with `rightCTA`
    defaulting to "Skip". This spec puts skip under the circle; worth comparing once both
    are on screen.

---

## Verification

End to end, in order:

1. `npm run storybook` — every new story renders at 390px, dark. Each of the 10 states is
   reviewable in isolation.
2. `test-run` via the Storybook MCP (not a package.json script) — play tests pass on all
   new stories; the a11y addon reports clean on each.
3. `npm run dev`, then play a full session:
   - 4 questions, progress moves 0 → 25 → 50 → 75 → 100 and **does not** move on re-attempts.
   - One question ridden to reveal: hint 1 → re-attempt → hint 2 → re-attempt → answer shown.
   - The hint stays visible on screen while re-recording.
   - One question skipped: advances immediately, no answer shown, no XP.
   - Summary reads `x/4`, and the timer excludes processing and hint-reading time.
4. **Never trapped:** from every state, confirm a skip, a text fallback or a save-and-resume
   is reachable in one tap.
5. **Permission:** block the mic in browser settings, reload, and confirm the denied state
   appears and routes into text rather than dead-ending.
6. **Text parity:** answer one question by voice and one by text; confirm identical XP.
7. **Cancel:** with touch or pointer emulation, hold, slide off, release — the take is
   discarded, not sent, and the hint line moves through all three phrasings.
8. **Explicit send only:** hold for 10 seconds in silence and confirm nothing submits until
   release. No auto-endpointing anywhere.
9. **Accessibility:** with tap mode on, complete a full turn without a sustained hold.
10. `prefers-reduced-motion: reduce` — the circle morph and result cross-fade degrade cleanly.
11. Re-run the Figma audit: the three drift fixes landed and nothing else moved.
