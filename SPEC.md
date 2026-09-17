# Voice recall — build spec

A 4-question voice active-recall step: the student explains a concept out loud, Knowie
judges it in text, with a two-tier hint ladder before reveal and a summary that reflects
hint use in XP.

This spec covers the 10 states missing from the current build. Recall, speech-to-text and
judging are mocked; the interaction, states and transitions are real.

---

## Screen list, in build order

Foundations come first — every screen below reads from them.

**Step 0a — library gaps that block all three screens**

None of these exist yet. They must be built before any screen below.

- `app/_components/screen/Screen.tsx` — the 390px shell: top, content and bottom regions.
  Figma composes every screen inside a `scaffold` (topNavigation, middleContent,
  bottomContent, bottomSheetOnly) plus a `Status Bar`. Neither is in the React library, and
  `scaffold` is not in design-system.md either — it is undocumented *and* unbuilt. Nothing
  currently pins an app bar to the top and an action row to the bottom of a 390px frame.
- `app/_components/textBlock/TextBlock.tsx` — body copy. Documented in design-system.md,
  never built. Reveal needs it for the answer, the primer for its explanation. Figma
  06/07/08 use raw TEXT nodes, so there is no precedent to copy either.
- `app/_components/verdictHeader/VerdictHeader.tsx` — the icon-plus-word pairing Figma 06
  draws with a bare Icon Slot. `iconSlot` has no standalone component, and design-system.md
  says a bare one placed on a screen "is a sign you're missing a component". Built, but
  **no longer used in the app**: it opened the full-page Result screen, which was removed
  when the result sheet became the verdict design (see screen 2).
- Fix `app/globals.css`. It is still the create-next-app scaffold — `--background: #ffffff`,
  `--foreground: #171717`, and a `prefers-color-scheme` block. This prototype is dark-only,
  so components render correctly in Storybook and on a white page under `next dev`. Those
  raw hexes also violate design-system.md's no-invented-values rule.

**Step 0b — recall foundations**

- `app/_recall/script.ts` — the 4 questions: prompt, answer, two hints, verdict sequence,
  canned transcripts.
- `app/_recall/useRecallSession.ts` — turn phase, ladder position, XP, pausable timer,
  voice/text mode, permission status.
- `app/_recall/usePushToTalk.ts` — hold, slide-to-cancel arming, tap-mode alternative.
  Nothing here detects when speech stops.
- Read `node_modules/next/dist/docs/01-app` before creating any route (AGENTS.md).

Three build notes that will otherwise bite:

- Imports are relative — there is no barrel file. Storybook's docs render
  `from 'knowunity-sprint'`, which does not resolve.
- Reading `?verdict=` uses `useSearchParams`, which must sit inside a `<Suspense>` boundary
  or it forces client rendering up to the nearest one and errors during prerender. Every
  component in the library is `'use client'`.
- The mic permission call needs an injectable seam. Tests run in headless Chromium via
  Playwright (`vitest.config.ts`), where `getUserMedia` rejects or hangs, so stories have to
  pass a stub rather than hit the real API.

Then, easiest first:

| # | Screen / state | Why it's here |
|---|---|---|
| 1 | Reveal | Static panel, one action |
| 2 | Result sheet: pass, partial, fail | `bottomSheet` over the turn; partial and fail differ by title |
| 3 | Entry + mic primer | Extends Figma 02; triggers the real permission prompt |
| 4 | Permission denied → text | Static panel that routes into the text path |
| 5 | Skip | No new component — `AppBar`'s `rightCTA`, wired to advance |
| 6 | Text fallback turn | `ChatInput` is already complete; the work is session-sticky mode |
| 7 | Status notices (4 If-time states) | One shared notice region, four copy sets |
| 8 | Cancel & re-record | Hardest: pointer gesture, arming, three-phase hint line, reduced motion |

---

## Per screen

### 1. Reveal

**States:** one.

**Components:** `AppBar` (`variant="leftAndRightButton"`, `leftIcon={<CloseIcon />}`,
`leftLabel="Close"`, `rightCTA="Skip"`) wrapping `ProgressIndicator` (`thickness="16"`) —
this is the library's documented recall header, `AppBar.stories.tsx:165`. Then `MascotSlot`
(`size="2XL"`, `expression="thinking"`), `CalloutBubble` for Knowie's line, `TextBlock` for the answer, and `Button`
(`variant="Primary"`, `size="L"`, `CTA="Next question"` — the label prop is `CTA`).

Not `leftAndRightIconButton`: that variant has no `rightCTA` and renders a `MoreVertIcon`
overflow button, which this screen has no use for.

**Student can:** read the answer, tap "next question". Scores zero XP.
Reached only by exhausting the ladder — never by skipping.

### 2. Result sheet — pass, partial, fail

**Decided 2026-09-15:** the verdict is a sheet that rises over the turn, not a separate
screen. The question stays in view behind it. The full-page Result screen this section used
to specify (`VerdictHeader` + `TextBlock` ×2 + `ButtonGroup`) was removed.

**States:** three verdicts on two `bottomSheet` results.

| Verdict | `result` | Title | Summary | Actions |
|---|---|---|---|---|
| Pass | `correct` | The feedback headline | The feedback detail | "Next question", or "Finish" on the last question |
| Partial | `incorrect` | "Almost…" | The feedback detail | "Try again" · "View hint 1" or "View hint 2" |
| Fail | `incorrect` | "Not quite…" | The feedback detail | "Try again" · "View hint 1" or "View hint 2" |

**Components:** `ResultSheet` (`app/_screens/resultSheet/`) wrapping `bottomSheet`, over the
voice or text turn with its body locked and its header live. The miss titles live in
`MISS_TITLE` in `script.ts`.

A pass sits on `feedback/success/subtle`; both misses sit on the neutral surface — no error or
warning panel is ever painted behind a miss. Partial and fail share one layout, and **the
title is what tells them apart**: partial acknowledges they were close, fail stays
encouraging without inventing credit. Titles stay short, because the sheet has a fixed
height and never scrolls.

The header keeps skip on a miss (the escape from being funnelled into "try again" or "view
hint") and drops it on a pass (the question is answered).

**Student can:** read the verdict and the nudge, then "try again", "view hint" or skip on a
miss, or move on after a pass.

### 3. Entry + mic primer

**States:** one. Extends Figma screen 02.

**Components:** `MascotSlot` (`size="3XL"`), `CalloutBubble`, `TextBlock` for the
explanation, `ButtonGroup` (`variant="Vertical"`, `primaryCTA="Let's get started"`,
`secondaryCTA="I'd rather type"`). Two actions, so a `ButtonGroup` rather than a lone
`Button`.

**Student can:** read why the mic is needed and what happens, then tap "let's get started",
which fires the real browser `getUserMedia` prompt. A text escape is present here too.

This screen also carries the **tap-mode toggle**. It is the only place the hold gesture is
explained, so the alternative to it sits alongside the explanation rather than in the header —
`AppBar`'s one `rightCTA` slot is taken by skip, so there is no room there anyway.

### 4. Permission denied → text

**States:** one.

**Components:** `MascotSlot`, `CalloutBubble`, `ButtonGroup` (`variant="Vertical"`).

**Student can:** see what they're missing and how to re-enable it, and continue in text —
the session switches to text mode and carries on. Never a dead end.

### 5. Skip

**States:** none of its own — it is `AppBar`'s `rightCTA`, which already defaults to `'Skip'`.

**Components:** the recall header, `variant="leftAndRightButton"`. Nothing new to build.

**Student can:** skip from any question state. Moves straight to the next question. No answer
shown, zero XP.

Skip lives in the header, matching the library's documented "Real usage — the recall header"
story, **not** under the circle as the first draft had it. That leaves "type instead" as the
only action below the circle.

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

Timeout and network are reachable through `?verdict=` only. Nothing in a normal session
triggers either — the mock judge is a fixed 2s and there are no real network calls — so both
are built and reviewable but never met by someone playing through.

### 8. Cancel & re-record

**States:** three phases of one recording state — holding, armed-to-cancel, released.

**Components:** `VoiceCircle` (`mode="recording"`), plus the hint line above it.

**Student can:** hold to speak, slide off the circle in **any** direction to arm cancel,
release to discard instead of send. Taught by the hint line, which reads "hold to speak" →
"release to send · slide away to cancel" → "release to cancel" when armed. Any direction
rather than one fixed axis, so a student who fumbles does not also have to remember which way.

**Accessible alternative:** tap-to-start / tap-to-send, automatic under assistive tech, plus
the manual toggle introduced in the primer (screen 3). Still fully explicit send — nothing
detects when speaking stops.

### Also changing

**Abandon sheet** (Figma 10) — `Checkbox` ×8 + `ButtonGroup`. Selecting "mic didn't work",
"can't speak out loud right now" or "I'd rather type" swaps the group's primary from "keep
reviewing" to "switch to typing". "Leave anyway" is the secondary and never moves, so leaving
stays one tap. This keeps the sheet inside `ButtonGroup`'s two slots rather than adding a third
action.

**Summary** (Figma 09) — `StatTile` ×3 + `Button`. Reads `x/4`, not `x/5`. Timer is real
elapsed with processing and hint-reading paused out.

**Path node** — `PathNode` becomes `progress="completed"` only if at least one question passed.

---

## How the mocked recall behaves

- **Verdicts are scripted per question.** The mock ignores what the student actually says.
  The sequence: **Q1** passes first try · **Q2** returns empty on the first attempt (a free
  retry), then partial, then passes after hint 1 · **Q3** rides the full ladder to reveal ·
  **Q4** passes. Every state appears once, difficulty peaks in the middle, and the session
  ends on a win.
- **Every verdict ships a canned transcript.** The **partial** transcript is coherent but
  incomplete — the student got part of it. The **fail** transcript shows visible
  speech-to-text mangling. That split is deliberate: it separates "you were close" from "we
  didn't hear you properly", which is the distinction that stops a miss reading as "I
  failed". **Not currently shown** — the result sheet has nowhere to put it (see Open).
- **Processing is a fixed ~2s delay.** Long enough to evaluate the state, short enough to
  click through.
- **The dev control is a query param only** — `?verdict=fail` and so on. No in-screen
  affordance, so there is nothing for a student to stumble onto, and every state has a
  linkable URL for review. It needs the `<Suspense>` boundary noted in Step 0b.
- **Replay is identical** — same questions, same script, every run. A student who returns
  and answers correctly can still be told they missed it. Accepted prototype limitation.
- **Empty and garbled are scripted too**, not detected from audio.

---

## Out of scope

From `sprint-context.md`: real speech-to-text, real judging, auto-endpointing, the optional
"say it back" repeat step, conversation branching on off-topic speech.

From the Voice UX Reference's triage: mic hardware busy, student switches language
mid-answer, pause/resume into one take.

Decided in this spec: Knowie never speaks or emits audio. No new tokens are added — a
`feedback/*` family already exists (success, error and warning, each with
bold/onBold/subtle/onSubtle) and should be used rather than duplicated. Three pieces that
design-system.md documents or Figma composes but the React library lacks — `textBlock`, the
screen `scaffold`, and a verdict header — are built in Step 0a rather than treated as out
of scope. No new Figma screens; the design file gets three surgical fixes only
(screen 09's `4/5` → `4/4`; screens 03/04/05 rebound from the local
`Voice circle (invented)` set, node `13543:10832`, to the documented `voiceCircle` set,
node `13558:14306`; screen 07's "Try Again"/"View Hint" to sentence case). The auto-chain
entry after the last quiz is not modelled — node tap only.

---

## Open

All eleven questions from the first draft are settled and folded into the sections above.
Two came back open when the result sheet replaced the Result screen (2026-09-15):

- **The transcript isn't shown.** The Voice UX Reference's fourth principle leans on "what we
  heard" so a miss reads as "it misheard me". `bottomSheet` has no slot for it. Bringing it
  back means changing the component.
- **Knowie's expression on a miss.** Resolved item 4 says `standby` on partial and fail; the
  sheet shows `bottomSheet`'s default, `confused`. Either the item or the sheet should change.

One thing remains to be *produced* rather than decided: the copy itself — four question
prompts for the Network Basics section, each with an answer, two hints and three
transcripts. I draft these; you edit them before anyone sees the prototype. Until they are
written, `script.ts` is the only thing blocking screens 1 and 2.

<details>
<summary>Resolved, for the record</summary>

1. **The 4 questions** — I draft all four for the Network Basics section, keeping the
   existing brute-force question as one of them; you edit before anyone sees them.
2. **Verdict sequence** — Q1 pass · Q2 empty, then partial, then pass after hint 1 · Q3 full
   ladder to reveal · Q4 pass.
3. **Transcripts** — partial is coherent but incomplete; fail shows visible speech-to-text
   mangling.
4. **Mascot expressions** — `approving` on pass, `standby` on partial and fail, `thinking` on
   reveal. Warmth only where it cannot misfire; Knowie never wears a reaction aimed at a
   student who struggled.
5. **Tap-mode toggle** — in the primer only. The header has no free slot.
6. **Dev control** — query param only, no in-screen affordance.
7. **Switch to typing in the abandon sheet** — swaps the group's primary; "leave anyway"
   never moves. Stays within `ButtonGroup`'s two slots.
8. **Slide-to-cancel** — any direction off the circle; copy reads "slide away to cancel".
9. **Timeout and network** — reachable via `?verdict=` only.
10. **Skip** — lives in `AppBar`'s `rightCTA`, as the library already ships it. Not under
    the circle.
11. **Partial vs fail** — copy-only distinction stands, but `feedback/success/subtle` is
    used behind a pass. No error or warning panel behind a miss. On the result sheet the
    copy that differs is the title: "Almost…" / "Not quite…".

</details>

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
10. `prefers-reduced-motion: reduce` — the circle morph and the result sheet's slide degrade cleanly.
11. `npm run build` — confirm no prerender error from `useSearchParams` sitting outside a
    `<Suspense>` boundary.
12. Load the app under both light and dark OS settings and confirm the page renders on
    `--color-background-page` either way — `globals.css` must no longer carry the stock
    white scaffold.
13. Re-run the Figma audit: the three drift fixes landed and nothing else moved.
