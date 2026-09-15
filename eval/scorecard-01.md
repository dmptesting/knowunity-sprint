# Scorecard 01: Primer, voice turn, hint overlay, result sheet

**Date:** 2026-09-15 · **Branch:** `component-library-and-spec` · **Rubric:** `eval/rubric.md`
**Screens:** `app/_screens/primer/`, `app/_screens/voiceTurn/`, `app/_screens/hintOverlay/`, `app/_screens/resultSheet/`
**Renders:** `eval/renders-01/` (64 PNGs at 390×844, dark). `INDEX.md` there maps each file to its state.

## Total

**5.2 / 10** (weighted, from the three adversarial critics)

**Hard gates: 1 of 4 failed**, which blocks the work whatever the total. The identical-states gate failed: partial and fail render the same.

| Weight | Points |
|---|---|
| High | 3 |
| Medium | 2 |
| Low | 1 |

The rubric names weights but not numbers, so these are assumed.

Sum of weighted scores = 78. Maximum weight = 15. 78 ÷ 15 = **5.2**.

No dimension scored 8 or above, so there are no 8+ scores to check for verification. Every critic did render or measure, and each says its score stays below 8 because of the defects it found, not because it only read the code.

## Per-dimension table

| Dimension | Weight | Critic | Score | Weighted | Verified via |
|---|---|---|---|---|---|
| System fidelity | High (3) | critic-system | 5 | 15 | `npm run check:tokens` (exit 0); grep for fallbacks, primitives and raw px; `docs-show` on every prop passed |
| Coherence | High (3) | critic-system | 5 | 15 | Walked the in-app render sequences side by side; `stories-preview` |
| Craft | High (3) | critic-craft | 5 | 15 | Playwright measurements on live Storybook (bounding boxes, `::after` sizes) across 11 stories; all renders |
| UX judgment | High (3) | critic-ux | 5 | 15 | Playwright walk of the app; pixel diffs; timeouts sampled over 9.5s |
| Accessibility | Medium (2) | critic-ux | 6 | 12 | Contrast computed on every text node in 9 states; 44×44 hit sampling; keyboard walks; ARIA inspection |
| Structure | Low (1) | critic-craft | 6 | 6 | Storybook `test-run` (31/31 pass); real-length copy via URL args with `scrollHeight` measured |
| **Total** | | | | **78 / 15 = 5.2** | |

## Hard gates

| Gate | Owner | Result | Evidence |
|---|---|---|---|
| Contrast ≥ 4.5:1 | critic-ux | PASS | Lowest is 4.65:1: `text/tertiary` on `background/page`, the 12px hint line (`VoiceTurn.module.css:56`). Others: notice 7.99, "Type instead" 8.40, overlay label 5.60, chips 6.77/6.64, sheet body 13.31, sheet CTAs 17.63/10.24. |
| Touch targets ≥ 44pt | critic-ux (confirmed independently by critic-craft) | PASS | "Type instead": painted 85×20, hit area 86×44. Hint chips: painted 54×32, hit 56×44. Notice retry 92×44. Close and Skip 48×48. Circle 161×161. Sheet CTAs 56 tall. Overlay CTA 132×56. |
| No raw hex | critic-system | PASS | `npm run check:tokens` printed "No raw hex colours in app/." and exited 0. |
| **No identical states** | critic-ux | **FAIL** | Partial vs fail (`app_q3_partial.png` vs `app_q3_fail.png`): title, panel, mascot and buttons are pixel-identical. Only rows 575–637 (the summary sentence) differ, and that sentence doesn't encode the verdict. |

## Pre-critic render pass

These are my flags from comparing screenshots before any critic ran. None of them was passed to a critic.

Pixel diffs count a pixel as changed when its RGB delta is over 24.

| # | Pair | Diff | What it means |
|---|---|---|---|
| R1 | `sb_primer__permission-granted` vs `sb_primer__permission-refused` | **0 px** | **Identical.** The refusal is never shown in Storybook: the stub's result only goes to a mock callback. The app does show it (`app_primer_refused_next`). |
| R2 | `app_q3_timeoutSoft_4.8s` vs `_8.8s`; `app_q3_timeoutRetry_4.8s` vs `_8.8s` | **0 px** each | **Identical over time.** Both notices appear at the fixed 2s judge mark (`useRecallSession.ts:211-226`), so the 4s soft → 8s retry sequence never plays. `_1s` of both verdicts are also 0 px apart. |
| R3 | `sb_voice-turn__notice-empty` / `notice-garbled` vs the session | n/a | **Never rendered in the session.** Empty and garbled go to the unsure sheet (`RecallSession.tsx:206-210`). |
| R4 | `sb_voice-turn__notice-timeout-*` vs `app_q3_timeout*_4.8s` | 1.4% / 1.8% | **Story ≠ app for the same state.** The stories pass `processing: true` (processing dot). The session shows a faded idle mic. |
| R5 | `sb_hint-overlay__default` vs `second-hint` | 3.4% (body only) | Both labels read "Hint", so the tier is never shown in Storybook. The app labels "Hint 1" and "Hint 2" correctly. |
| R6 | `app_q3_partial` vs `app_q3_fail` | 0.97% | Near-identical: summary sentence only. Became the hard-gate failure above. |
| R7 | `app_q3_empty` vs `app_q3_garbled` (unsure sheets) | 0.93% | Near-identical: summary sentence only. |
| R8 | `sb_voice-turn__holding` vs `armed-to-cancel` | 0.33% | Near-identical: the 12px caption only; the circle doesn't change. |

## Where critics converged

Several critics reached the same defect independently. These are the highest-confidence findings.

| Defect | Raised by | Render pass |
|---|---|---|
| Partial and fail render the same (title hard-coded to "Not quite…", `RecallSession.tsx:230`) | system (fidelity 2, coherence 6), ux (UX 1, gate) | R6 |
| Timeout notices fire at 2s, lose the processing look, and never move from soft to retry; `TIMEOUT_SOFT_MS`/`TIMEOUT_RETRY_MS` are never imported | craft (craft 3), ux (UX 3) | R2, R4 |
| Empty/garbled are shown as `statusNotice` in stories but as the unsure `bottomSheet` in the app | system (fidelity 3, coherence 5), craft (structure 4), ux (UX 6) | R3 |
| Tap mode can't be reached: `setTapMode` is never called, and the primer toggle was removed | system (coherence 8), craft (structure 5), ux (a11y 1) | none |
| "Try again" is a full-width lipped button on the sheet but a hugging `Button` on the overlay | system (coherence 1), craft (craft 4) | none |
| Progress bar changes length when Skip is dropped as a sheet rises | system (coherence 4), craft (craft 6) | none |
| Stale geometry comments: a 200px box with a 320px halo, a `.hint` class that no longer exists, the primer alignment note | system (fidelity 8, coherence 7), craft (craft 9) | none |
| Armed-to-cancel differs from holding only by a 12px caption | ux (UX 4, a11y 4) | R8 |
| "Hint 2" story renders the label "Hint" | system (coherence 8) | R5 |
| Hint XP cost is never shown to the student | ux (UX 5), and separately critic-ambition | none |

## Every finding, by dimension

### System fidelity: 5 (critic-system)

1. **The result sheet uses `bottomSheet` for the recall verdict, which is explicitly forbidden.**
   - Evidence: `design-system.md:69` ("DON'T: use it for the voice-recall verdict") and `BottomSheet.tsx:112-113` forbid it. `RecallSession.tsx:214-239` sends every verdict through `ResultSheet`. `verdictHeader` (`design-system.md:93`) is unused, and `app/_screens/result/Result.tsx` is imported nowhere.
   - Fix: make docs and code agree. Either compose the verdict from `verdictHeader`, or remove the DON'T and document the mapping as a decision.
2. **Partial and fail are collapsed into `incorrect` with the same title.**
   - Evidence: `RecallSession.tsx:226-231`; `app_q3_partial.png` vs `app_q3_fail.png`. `design-system.md:93` says they "differ only in copy", but the heading copy is identical.
   - Fix: give partial and fail different titles, or use `verdictHeader` with `partial`/`fail`.
3. **Empty and garbled go to `bottomSheet` `unsure` instead of `statusNotice`.**
   - Evidence: `design-system.md:91` scopes `statusNotice` to "nothing heard, heard badly, slow, offline". `RecallSession.tsx:206-247` sends empty and garbled elsewhere. `VoiceTurn.stories.tsx:233-247` still shows the `statusNotice` version.
   - Fix: restore `statusNotice`, or narrow the doc and delete those stories.
4. **Undocumented props are passed to library components.**
   - Evidence: `className` on `Button` (`VoiceTurn.tsx:187`), used to recolour Tertiary (`VoiceTurn.module.css:127-129`). `className` on `MascotSlot` (`Primer.tsx:75`) and `KnowieSays` (`VoiceTurn.tsx:197`). `aria-label` on `Chips` (`HintChips.tsx:47`).
   - Fix: wrap these in screen-owned elements, or document a quiet Tertiary option.
5. **Mascot expressions disagree across spec, code and docs.**
   - Evidence: `SPEC.md:274` says `approving` on pass, `standby` on partial/fail, `thinking` on reveal. The code uses `giggling` on pass (`RecallSession.tsx:220`), `confused` on misses (`BottomSheet.tsx:24`) and `standby` on reveal (`:30`). `design-system.md:71` says `excited`.
   - Fix: align `RecallSession.tsx:220`, `BottomSheet.tsx:22-31` and `design-system.md:71`.
6. **Hint chips add hue-named variants to a known debt.**
   - Evidence: `design-system.md:110` calls `accent/blue` and `accent/magenta` debt, yet `design-system.md:95` and `HintChips.tsx:9` add `magenta`/`blue` chip variants.
   - Fix: name them for meaning (e.g. `hintTier1`/`hintTier2`), or use Primary `active`.
7. **A promotion that has already triggered was never done.**
   - Evidence: `component-gaps.md:31` logs the centred Headline S line as "Promotion rule has fired, not yet promoted". `Primer.module.css:29-36` `.line` is one of the three inline copies.
   - Fix: promote it and replace the three copies.
8. **Some sizing disclosures are stale.**
   - Evidence: `VoiceTurn.module.css:26-30` and `VoiceTurn.tsx:155-158` justify `Space/1600` by a 320px halo on a 200px box. The actual box is 160px with a 224px halo (`VoiceCircle.module.css:10-11, 45-55`). `component-gaps.md:22` repeats the old numbers, and `VoiceTurn.module.css:51-54` refers to a `.hint` rule that no longer exists.
   - Fix: re-derive the gap (the nearest step is `Space/800`) or re-justify 64px, and correct the comments.
9. **Two literals have no disclosure.**
   - Evidence: `VoiceTurn.module.css:150` `opacity: 0`; `ResultSheet.module.css:14` `z-index: 1`.
   - Fix: add one-line disclosure comments.
10. **Spotlight's documented label style doesn't match its use.**
    - Evidence: `design-system.md:89` says Caption M Bold; `HintOverlay.tsx:77` uses `labelSize="L"` (Headline S).
    - Fix: document `labelSize`.

### Coherence: 5 (critic-system)

1. **"Try again" looks different one tap apart.**
   - Evidence: on the sheet it is full width with a lip (`BottomSheet.module.css:141-164`, `app_q3_partial.png`). On the overlay it is library `Button` L, hugging its label (`HintOverlay.tsx:63`, `app_q2_hint1_overlay.png`). The primer CTA matches the overlay.
   - Fix: one primary-action treatment across the loop.
2. **Hint 1 has two colours.**
   - Evidence: the chip is magenta (`app_q3h1_idle_chip.png`, `HintChips.tsx:9`). The overlay label is brand violet for both tiers (`app_q2_hint1_overlay.png`, `Spotlight.module.css:43-45`), despite the comment at `HintOverlay.tsx:67-69`.
   - Fix: one tier treatment on both surfaces.
3. **The hint overlay drops the loop's scaffold.**
   - Evidence: `app_q2_hint1_overlay.png` has no progress, Skip or Knowie. The ladder runs through a sheet, then a full-screen replacement, then a turn with chips.
   - Fix: keep `AppBar` `leftAndRightButton` with `ProgressIndicator` on the overlay (`HintOverlay.tsx:55-60`).
4. **The header reflows when a sheet rises.**
   - Evidence: `VoiceTurn.tsx:139` switches to `leftIconButtonOnly`. The track ends at x≈316 in `app_q1_idle.png` and x≈374 in `app_q1_correct.png`, `app_q2_unsure_empty.png` and `app_q3h2_reveal.png`.
   - Fix: keep the Skip slot's width, or disclose the jump.
5. **"Couldn't judge" has two treatments, and Storybook disagrees with the app.**
   - Evidence: `app_q3_garbled.png` (sheet) vs `app_q3_network.png` (inline notice) vs `sb_voice-turn__notice-garbled.png` (inline notice).
   - Fix: see fidelity 3.
6. **Partial and fail are visually identical.**
   - Evidence: `app_q3_partial.png` vs `app_q3_fail.png`.
   - Fix: see fidelity 2.
7. **Knowie speaks in three layouts.**
   - Evidence: the primer is 3XL, centred, bare text (`Primer.tsx:75-83`). The turn is 2XL with a bubble. The sheet is 2XL with no bubble. `design-system.md:85` says `knowieSays` everywhere in the loop, and `component-gaps.md:19` says the primer left-aligns Knowie, but `app_primer.png` shows him centred.
   - Fix: correct the ledger and document the exceptions.
8. **Labels and wiring drift from the shipped flow.**
   - Evidence: the "Hint 2" story renders "Hint" (`sb_hint-overlay__second-hint.png`, default at `HintOverlay.tsx:42`). The `tapMode` doc says "Set from the primer's toggle" (`VoiceTurn.tsx:52`), but the toggle was removed (`Primer.tsx:36-40`) and `setTapMode` is never called, against `SPEC.md:279`.
   - Fix: pass `label` in the story, and restore the toggle or remove tap mode.

### Craft: 5 (critic-craft)

1. **The voice circle moves 58px during one continuous wait**, even though its own comment (`VoiceTurn.tsx:176-180`) says it must not move.
   - Evidence: circle top measured at 408 while processing, 426 at soft timeout, 466 at retry timeout. `sb_voice-turn__processing` → `notice-timeout-soft` → `notice-timeout-retry`.
   - Fix: give `.notice` (`VoiceTurn.module.css:70`) a fixed block-size, or position it absolutely.
2. **Tap mode moves the circle 12px when a take starts.**
   - Evidence: Tertiary "Type instead" swaps for Secondary "Cancel". `sb_voice-turn__tap-mode` vs `tap-mode-recording`: circle centre 487 → 475, hint line 335 → 323. The reserve at `VoiceTurn.tsx:186-192` only covers the hold path.
   - Fix: give both branches a shared min block-size, or put them in one grid cell and toggle visibility.
3. **In the app, soft timeout loses its processing look and never escalates.**
   - Evidence: `useRecallSession.ts:217-225` sets `phase='notice'`, so the circle shows a faded idle mic and "Type instead" returns (`app_q3_timeoutSoft_4.8s`, `_8.8s`). The story shows the processing dot (`VoiceTurn.stories.tsx:251`). The notice shows at 2s, not 4s. `TIMEOUT_SOFT_MS`/`TIMEOUT_RETRY_MS` (`notices.ts:75-76`) are never imported.
   - Fix: stay in `processing`, with timers driving the soft and retry copy.
4. **The same "Try again" has two treatments.**
   - Evidence: 334×56 with a lip on the sheet (`BottomSheet.module.css:141-164`) vs 131×56 hugging on the overlay (`app_q2_incorrect_partial` vs `app_q2_hint1_overlay`). The stated reason for bypassing `Button` ("no verdict colours", `:130-132`) no longer applies (`:166-170`).
   - Fix: one Primary L treatment.
5. **Two side insets on one screen.**
   - Evidence: the Knowie row uses Space/400 (`VoiceTurn.module.css:20`, bubble right edge 374). The stage and notice use Space/600 (`:39`, notice right edge 366). `sb_voice-turn__notice-empty`.
   - Fix: use one inset.
6. **Progress fill changes length for the same value.**
   - Evidence: Skip is dropped on correct, unsure and reveal (`RecallSession.tsx:273`), so the bar stretches from 316 to 374 and the 50% fill moves about 28px (`app_q3h1_incorrect_hint2` vs `app_q3_garbled`).
   - Fix: keep the right slot's width.
7. **The result sheet's text column is 198px for 18px body copy.**
   - Evidence: widows "go." (`app_q2_unsure_empty`) and "more." (`app_q3h1_incorrect_hint2`).
   - Fix: add `text-wrap: pretty` at `BottomSheet.module.css:112`; consider Space/400 for the content inset (`:89`).
8. **"Let's get started" gives no feedback while the OS prompt is up.**
   - Evidence: `Primer.tsx:47-58` tracks `asking` but always renders `Default` (`:64-69`). `Button` documents a `Loading` state.
   - Fix: `state={asking ? 'Loading' : 'Default'}`.
9. **Stale geometry comments.**
   - Evidence: `VoiceTurn.module.css:26-31` and `component-gaps.md:22` (200/320 geometry). `VoiceTurn.module.css:51-54` (a `.hint` class that doesn't exist). `Primer.module.css:5` says Space/400 but `:15` uses 600. `component-gaps.md:19` (left-aligned Knowie).
   - Fix: rewrite them to match the rendered values.
10. **Close-button focus ring clipped at the viewport top.**
    - Evidence: `sb_hint-overlay__close-button-dismisses`, `sb_voice-turn__locked-under-sheet`.
    - Fix: Space/100 block-start padding on `Screen` `.top`, or a negative `outline-offset`.

### UX judgment: 5 (critic-ux)

1. **Partial and fail look the same, and the transcript is gone.**
   - Evidence: the title is hard-coded `'Not quite…'` (`RecallSession.tsx:230`). The script headlines ("Close, you named complexity.") go unused. The pixel diff covers only rows 575–637, and the two summaries mean the same thing. The transcript was dropped (`ResultSheet.stories.tsx:64`), which breaks principle 4 and `SPEC.md:218`.
   - Fix: `title: session.feedback.headline`. Show the transcript, and log the missing `bottomSheet` slot in `component-gaps.md`.
2. **The primer doesn't explain the mic and has no way out.**
   - Evidence: `Primer.tsx:36-40, 64-71` removed the explanation, "I'd rather type" and the tap toggle required by `SPEC.md:116-127`. `app_primer.png` never mentions speaking and has no close button. Under `?mic=real` the only control fires the OS prompt (principles 3 and 5).
   - Fix: restore the `ButtonGroup` with `secondaryCTA="I'd rather type"`, add an explanation line, and restore the toggle.
3. **The timeout state claims to be thinking but shows an idle mic, and never moves on.**
   - Evidence: the notice appears at 2s (`useRecallSession.ts:215-227`). Processing is false, so the circle fades with the idle mic (`VoiceTurn.tsx:232`, `VoiceTurn.module.css:109`). At 9.5s the accessible name was still "Ready to record". `app_q3_timeoutSoft_4.8s` and `_8.8s` are identical, against `SPEC.md:173`. It is not a trap, but it is a dead state.
   - Fix: hold `processing` and drive copy from the timeout constants.
4. **Armed-to-cancel differs from holding by one 12px caption.**
   - Evidence: `app_q1_holding.png` vs `app_q1_armed.png`: caption rows 330–341 plus waveform noise. The caption sits where a finger sliding up covers it.
   - Fix: change the circle while armed (e.g. `.unavailable` opacity) and raise the caption to `text/primary`.
5. **Nothing says a hint costs XP.**
   - Evidence: "View hint 1/2" (`app_q3_partial.png`, `app_q3h1_incorrect_hint2.png`) and the overlay are silent, against `sprint-context.md:23-24`.
   - Fix: `bottomSheet` `hintLabel` (`BottomSheet.tsx:77`), or a line in the summary.
6. **Stories and the session show empty/garbled differently.**
   - Evidence: `sb_voice-turn__notice-empty.png` vs `app_q2_unsure_empty.png` (diff covers rows 270–843).
   - Fix: drop or relabel those stories.
7. **The hint overlay hides the question.**
   - Evidence: in `app_q2_hint1_overlay.png`, "One of the two changes…" appears with its question off screen.
   - Fix: show the question as secondary text.

Credited as holding up:
- Idle, recording and processing each have a distinct glyph.
- Denied routes to text.
- Skip is live on the incorrect sheet.
- No auto-endpointing in code or copy.

### Accessibility: 6 (critic-ux)

1. **Tap mode can't be reached by touch or mouse users.**
   - Evidence: `setTapMode` is never called; `RecallSession.tsx:329` only passes the value through. `SPEC.md:193` and verification step 9 can't be carried out.
   - Fix: wire the primer toggle.
2. **Processing isn't announced and keyboard focus is lost.**
   - Evidence: after a keyboard send the circle becomes `disabled` (`VoiceTurn.tsx:236`) and focus falls to `<body>`. There is no live region, and the name stays "Hold to record your answer" (`:241`).
   - Fix: use `aria-disabled` and add a polite live region when processing starts.
3. **Closing the hint overlay drops focus.**
   - Evidence: after Escape, focus is on `<body>` (`RecallSession.tsx:284`).
   - Fix: return focus to the opener.
4. **The armed state depends on a 12px caption at 4.65:1 that a finger can cover.**
   - Evidence: `VoiceTurn.module.css:56`.
   - Fix: see UX 4.
5. **The result sheet announces only its title.**
   - Evidence: `ResultSheet.tsx` uses `aria-label={props.title}` with no `aria-describedby`.
   - Fix: point `aria-describedby` at the summary.

Credited as holding up:
- `lockBody` inert keeps Tab out of the locked turn.
- Focus moves into the sheet.
- Keyboard Enter/Enter records without a hold.
- `statusNotice` has `role=status`.
- Hint chips carry text as well as colour.

### Structure: 6 (critic-craft)

1. **The fixed-height result sheet clips at real content lengths.**
   - Evidence: a two-line title with a three-line summary measures 200px of content in 196px, hidden by `overflow: hidden` (`BottomSheet.module.css:87`). The session avoids this only by hard-coding "Not quite…" (`RecallSession.tsx:230`) and discarding script headlines (`script.ts:179`).
   - Fix: shrink the mascot or scroll above the pinned actions, or cap titles at one line in the copy spec.
2. **Layout is held together by one-off patches rather than the scaffold.**
   - Evidence: the overlay needs `position:absolute; inset:0` (`HintOverlay.module.css:11-24`). The action row is reserved with `visibility:hidden` (`VoiceTurn.tsx:174-192`), which fails in tap mode. The sheet is positioned outside `Screen` (`RecallSession.tsx:344-347`).
   - Fix: add a stable bottom-slot contract and an overlay region to `Screen`.
3. **The documented hint layer was replaced.**
   - Evidence: the scaffold names `hintCard`; the build uses a full-screen `Spotlight` plus chips (`HintOverlay.tsx:29-39`), and `hintCard` is unused.
   - Fix: update the Scaffold section, or restore `hintCard`.
4. **Stories show states the session never produces.**
   - Evidence: `notice-empty` and `notice-garbled` vs `RecallSession.tsx:206-210, 240-247`. Timeout stories pass `processing: true` (`VoiceTurn.stories.tsx:251, 257`).
   - Fix: make the stories match the session, or delete the unreachable variants.
5. **Tap-mode wiring is dead.**
   - Evidence: `setTapMode` is exported (`useRecallSession.ts:370`) and never called. The doc at `VoiceTurn.tsx:52` is stale, and the Cancel branch (`:161-172`) can't be reached.
   - Fix: wire it, or remove it.

## Blind spots

| Critic | Blind spot (as stated) |
|---|---|
| critic-system | Couldn't check the compositions against the Figma frames: frame 06/07 parity and `bottomSheet`'s real variant set are known only from `design-system.md`. Didn't walk the ladder's end state (the Reveal page) side by side, because text turn, reveal and summary are out of scope. |
| critic-craft | No real notched iPhone: `env(safe-area-inset-top)` and the true iOS touch path were only simulated. Didn't capture the 280ms sheet rise or the 180ms stage fade frame by frame, so jumps during those transitions weren't checked. |
| critic-ux | No real iOS VoiceOver, where a double-tap may not produce the `detail === 0` click the keyboard fallback relies on. Couldn't test a physical finger covering the armed caption, OS-level reduced motion, or the text turn screen. |
| Render pass (orchestrator) | Captured at deviceScaleFactor 1 and at fixed times, so animation mid-states (waveform, think-dot breathing, sheet rise) are sampled, not compared frame by frame. Didn't capture the primer's pending-prompt state (`asking`) because the mock resolves instantly. |

---

## Ambition (critic-ambition): kept separate

**6 / 10: informational only. Not part of the 5.2 total above.**

**Verified via:** the renders; `docs-show` for StatTile, Spotlight (including its "With a footnote" story), KnowieSays, MascotSlot, BottomSheet, HintChips, VoiceCircle and Summary; `stories-preview` URLs. The proposals themselves were not rendered.

**Why 6 and not 5:** two compositions go past the obvious reading.
- Spent hints hang off Knowie's line as reopenable `HintChips` (`VoiceTurn.tsx:197-200`, `app_q3h2_idle_chips.png`).
- The result sheet rises over a turn that stays visible, with the expression varying by result (`BottomSheet.tsx:22-31`).

**Why not higher:** the hint-for-XP trade `sprint-context.md` says the student should see appears nowhere on these four screens.

**What the work is settling for:**
- **Hint overlay:** `Spotlight` shows only label and body, with nothing about what the hint cost. Its documented `footnote` prop is left empty, although its own story uses it for XP copy. `HintOverlay.tsx:73-80`, `app_q2_hint1_overlay.png`, `app_q3h1_hint2_overlay.png`.
- **Incorrect sheet:** keeps the default "View hint 1/2" label. The XP cut (10 → 6 → 3, `useRecallSession.ts:34-36`) is never stated. `RecallSession.tsx:233`, `app_q2_incorrect_partial.png`.
- **Correct sheet:** no per-question XP. XP first appears as a session total on Summary (`Summary.tsx:78`). `app_q1_correct.png`, `app_q4_correct_last.png`.
- **Voice turn:** Knowie stays on `standby` through idle, holding and processing (`VoiceTurn.tsx:197`, `app_q1_processing.png`).
- **Primer:** 3XL standby mascot, one line, one button, with nothing previewing the interaction (`Primer.tsx:75-83`). Recorded as the designer's call, so noted, not proposed.

**Proposals (ranked):**
1. **Show the hint trade at both ends of the tap.**
   - Before: `BottomSheet` `hintLabel`, e.g. "View hint 1 (−4 XP)".
   - After: `Spotlight` `footnote`, e.g. "This question is now worth 6 XP".
   - Cost: two strings on two documented props, covering the one thing sprint-context says must be visible.
2. **Show what a correct answer earned, next to the hints that shaped it.**
   - What: a `StatTile` (`stat="xp"`, `label="This question"`, `value="+6"`) in the roughly 270px the faded stage leaves empty on a correct sheet, directly under the `HintChips`.
   - Why it's allowed: `design-system.md:47` names this use.
3. **Let Knowie be the one thinking.**
   - What: `KnowieSays` `expression="thinking"` only while `processing`, alongside `VoiceCircle` `mode="processing"`.

**Blind spot:** none of the proposals were rendered. #2 may crowd the chips or the sheet edge at real copy lengths. #3 reuses `thinking`, which the unsure sheet already wears, and that could blur processing and "I missed that".
