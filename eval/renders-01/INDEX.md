# Renders — review 01

Every state of the four screens under review, captured 2026-09-15 with Playwright (Chromium) at a 390×844 viewport, `colorScheme: dark`, deviceScaleFactor 1, reduced motion off.

- `sb_*` — the Storybook story (`http://localhost:6006/iframe.html?id=…`), captured ~2.5s after load, so any `play` function has already run.
- `app_*` — the running Next app (`http://localhost:3000/`), driven with a real mouse pointer via the review query params (`?question=`, `?hints=`, `?verdict=`, `?mic=`).

Screens under review and their source:

| Screen | Source |
|---|---|
| Primer | `app/_screens/primer/` |
| Voice turn | `app/_screens/voiceTurn/` |
| Hint overlay | `app/_screens/hintOverlay/` |
| Result sheet | `app/_screens/resultSheet/` (wraps `app/_components/bottomSheet/`) |

Session wiring for all four: `app/_recall/RecallSession.tsx`, `app/_recall/useRecallSession.ts`.

## Primer

| File | State | How reached |
|---|---|---|
| `sb_primer__default` | Default | story `screens-primer--default` |
| `sb_primer__permission-granted` | Tapped start, stub grants | story, after play |
| `sb_primer__permission-refused` | Tapped start, stub refuses | story, after play |
| `sb_primer__long-line` | Longer opening line | story |
| `app_path` | Study path before entry | `/?mic=deny` |
| `app_primer` | Primer in session | path → "Explain out loud" |
| `app_primer_refused_next` | Screen after refusing | `?mic=deny`, tap "Let's get started" |
| `app_primer_granted_next` | Screen after granting | mock mic, tap "Let's get started" |

## Voice turn

| File | State | How reached |
|---|---|---|
| `sb_voice-turn__idle` | Idle | story |
| `sb_voice-turn__holding` | Holding (forced phase) | story |
| `sb_voice-turn__armed-to-cancel` | Armed to cancel (forced phase) | story |
| `sb_voice-turn__processing` | Processing | story |
| `sb_voice-turn__slide-away-cancels` | End of slide-away gesture play | story, after play |
| `sb_voice-turn__release-sends` | End of release-sends gesture play | story, after play |
| `sb_voice-turn__tap-mode` | Tap mode, end of play (idle) | story, after play |
| `sb_voice-turn__tap-mode-recording` | Tap mode, recording | story, then tapped "Tap to start recording" |
| `sb_voice-turn__keyboard-falls-back-to-tap` | End of keyboard play | story, after play |
| `sb_voice-turn__notice-empty` | Notice: nothing heard | story |
| `sb_voice-turn__notice-garbled` | Notice: garbled | story |
| `sb_voice-turn__notice-timeout-soft` | Notice: timeout at 4s | story |
| `sb_voice-turn__notice-timeout-retry` | Notice: timeout at 8s | story |
| `sb_voice-turn__notice-network` | Notice: offline | story |
| `sb_voice-turn__skip` | Skip story, after play | story |
| `sb_voice-turn__hint-shown` | One hint chip | story |
| `sb_voice-turn__second-hint-shown` | Two hint chips | story |
| `sb_voice-turn__locked-under-sheet` | Locked (no sheet drawn) | story |
| `app_q1_idle` | Q1 idle | `?question=1` |
| `app_q1_holding` | Q1 pointer held on circle | real pointer down |
| `app_q1_armed` | Q1 pointer slid off circle | pointer moved one circle-height up |
| `app_q1_processing` | Q1 after release | ~300ms after pointer up |
| `app_q2_after_retry` | Q2 after "Try again" on unsure sheet | scripted Q2 |
| `app_q2_turn_with_hint1` | Q2 turn after dismissing hint 1 | scripted Q2 |
| `app_q3h1_idle_chip` | Q3 with one hint spent | `?question=3&hints=1` |
| `app_q3h2_idle_chips` | Q3 with both hints spent | `?question=3&hints=2` |
| `app_q3_network` | Offline notice in session | `?question=3&verdict=network`, hold + release, +3s |
| `app_q3_timeoutSoft_1s` / `_4.8s` / `_8.8s` | Soft timeout, sampled over time | `?question=3&verdict=timeoutSoft`, times after release |
| `app_q3_timeoutRetry_1s` / `_4.8s` / `_8.8s` | Retry timeout, sampled over time | `?question=3&verdict=timeoutRetry`, times after release |

## Hint overlay

| File | State | How reached |
|---|---|---|
| `sb_hint-overlay__default` | Hint 1 | story |
| `sb_hint-overlay__second-hint` | Hint 2 | story |
| `sb_hint-overlay__close-button-dismisses` | After ✕ play | story, after play |
| `sb_hint-overlay__escape-dismisses` | After Escape play | story, after play |
| `sb_hint-overlay__long-hint` | Longest hint | story |
| `app_q2_hint1_overlay` | Hint 1 in session | Q2 partial → "View hint 1" |
| `app_q3h1_hint2_overlay` | Hint 2 in session | `?question=3&hints=1&verdict=fail` → "View hint 2" |

## Result sheet

| File | State | How reached |
|---|---|---|
| `sb_result-sheet__correct` | Correct | story |
| `sb_result-sheet__incorrect` | Incorrect, hint 1 | story |
| `sb_result-sheet__incorrect-second-hint` | Incorrect, hint 2 | story |
| `sb_result-sheet__unsure` | Unsure | story |
| `sb_result-sheet__reveal` | Reveal | story |
| `app_q1_correct` | Correct in session | Q1 scripted pass |
| `app_q4_correct_last` | Correct, last question | `?question=4` |
| `app_q2_unsure_empty` | Unsure (empty) in session | Q2 scripted first attempt |
| `app_q2_incorrect_partial` | Incorrect after a partial | Q2 scripted second attempt |
| `app_q3_partial` | Forced partial | `?question=3&verdict=partial` |
| `app_q3_fail` | Forced fail | `?question=3&verdict=fail` |
| `app_q3_empty` | Forced empty | `?question=3&verdict=empty` |
| `app_q3_garbled` | Forced garbled | `?question=3&verdict=garbled` |
| `app_q3h1_incorrect_hint2` | Incorrect offering hint 2 | `?question=3&hints=1&verdict=fail` |
| `app_q3h2_reveal` | Reveal in session | `?question=3&hints=2&verdict=fail` |
