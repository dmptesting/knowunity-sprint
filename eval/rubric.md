# Grading rubric

For scoring built screens in this prototype against the settled scope (`sprint-context.md`), the states checklist (`Voice UX Reference *.md`), and the component rules (`design-system.md`). A score is a judgment about *this* project's decisions, not a generic UI-quality checklist — the anchors below are written against what this prototype specifically committed to.

## Scoring rules

- **"Looks good" is a 6, not a 9.** A 6 means nothing is visibly broken and the intent is legible. A 9 means it survives a senior critique untouched — no "well, but..." from a reviewer who knows this spec cold. Most first passes top out at 6-7; treat anything higher as earned, not assumed.
- **A dimension scores 8 or above only if it was verified by rendering, measuring, or testing** — a Storybook preview actually opened, a contrast ratio actually measured, a state actually triggered and observed, `npm run check:tokens` actually run. Never from reading the code and inferring it should work. If you haven't verified it, cap the score at 7 regardless of how correct the code looks on inspection, and say so.
- Score each dimension 1-10. Multiply by weight, sum, normalize if needed. Record *how* each 8+ score was verified (screenshot, measurement, test run) next to the score — an unverifiable 8+ is a reporting error, not a high score.

## Dimensions

### System fidelity — weight: High

**What it's scoring:** Does every value on screen trace back to a real entry in `tokens/tokens.json`, and every component to an entry in `design-system.md` (or, for code-only pieces, `component-gaps.md`)? This is the most mechanically checkable dimension — most of it is a grep and a script run, not a feel.

- **4:** Some raw hex or raw pixel values are visible in component source, or a component is used that has no corresponding entry in `design-system.md`/`component-gaps.md`. `npm run check:tokens` fails and the failures haven't been fixed.
- **6:** `npm run check:tokens` passes and every component used is documented somewhere — but a value was clearly eyeballed to "look close" to a token rather than bound to it (e.g. a spacing value that isn't a real `Space/*` step, a color read as a hex that happens to match a token instead of the CSS variable). No disclosed substitutions where the file called for one (per design-system.md's "snap to nearest and disclose" rule).
- **9:** Every value is a bound token reference (`var(--...)`), confirmed by inspection, not just visual match. Every component matches its documented variant vocabulary (e.g. `voiceCircle`'s `mode` values used exactly as `idle`/`recording`/`processing`, not repurposed as a generic spinner). Any place a value had to snap to the nearest token instead of an exact match is explicitly disclosed in code comments or a PR note, matching the standard the sprint already set for `voiceCircle`'s icon geometry and `pathNode`'s 48px ring.

### Coherence — weight: High

**What it's scoring:** Whether the built screens read as one continuous product moving through the recall loop, or as N independently-built screens that happen to sit in the same repo. This is about cross-screen consistency: spacing rhythm, mascot treatment, copy voice, transition logic between states.

- **4:** Screens use different treatments for the same concept — e.g. one screen's processing state uses `voiceCircle`'s `processing` mode and another improvises its own spinner; `knowieSays` appears with different bubble tail directions or icon spacing between screens with no reason. A student moving through idle → recording → processing → result would notice the seams.
- **6:** The core recall loop (idle, recording, processing, pass/partial/fail) is visually consistent, but a secondary or newer screen — the hint layer, a status notice, the abandon sheet — feels bolted on: different spacing scale, a component reused slightly off-spec, or a state that doesn't hand off cleanly to the one before or after it.
- **9:** Every state in `SPEC.md`'s screen list, including the "Also changing" and status-notice states, uses the same scaffold logic described in design-system.md ("Scaffold" section: top/content/hint layer/action row/transient) consistently. The hint ladder (hint 1 → re-attempt → hint 2 → re-attempt → reveal) reads as one mechanism across every screen it touches, not a per-screen reinvention. Verified by walking the actual sequence in Storybook or the running app end to end, not by eyeballing screens in isolation.

### Craft — weight: High

**What it's scoring:** Spacing, rhythm, state completeness, and the small deliberate decisions — the difference between a screen that's technically correct and one where someone clearly sweated the details `design-system.md` flags as easy to get wrong (touch targets, placeholder text, disclosed token substitutions, the calloutBubble's fixed 342px width, statTile's confirmed-not-reverse-engineered padding).

- **4:** Visible placeholder content shipped as if real (the "1/2 words" chip text, a snackbar still showing its default two-line placeholder) — the exact failure design-system.md calls out as a known gap, not a model to repeat. Uneven spacing between otherwise-identical rows. Touch targets match the painted (small) box instead of the expanded `Target/Minimum` hit area.
- **6:** Spacing is consistent and nothing is placeholder, but the small judgment calls are default rather than considered — e.g. `hintCard` dropped in exactly as documented without checking whether it actually reads as a hint in context (design-system.md explicitly asks for that check), or a text style stepped down without checking it doesn't create the two-sheet-different-title-size problem the bottomSheet writeup describes as previously tried and reverted.
- **9:** The details design-system.md calls out by name are visibly right: hit areas expand past the painted box via a centred `::after` at `Target/Minimum`, not a resized visual element. No component keeps its Figma placeholder text. Any unproven-in-context component (`hintCard`, `appBar`, `snackbar`, `textBlock`, `pathNode`'s format marker) has been checked against a real composition and either confirmed or visibly adjusted, not just dropped in on faith. Verified by opening the rendered screen and measuring, not by reading the component's props.

### UX judgment — weight: High

**What it's scoring:** Whether the required states are actually handled, whether hierarchy makes the current system state obvious at a glance (Voice UX Reference principle 1), and whether every failure/exit path is designed rather than assumed. This is the dimension most directly graded against the Voice UX Reference's six principles and its "States to design" table.

- **4:** A "Must"-priority state from the Voice UX Reference table is missing or unhandled — e.g. no distinct visual for `idle`/`recording`/`processing`, permission-denied has no route to text fallback, or skip/cancel-and-re-record isn't reachable. Any state where color is the *only* differentiator (violates principle 1's "pair it with a shape, icon, or motion"). Any trap: a required action with no skip, text fallback, or save-and-resume.
- **6:** All "Must" states from the table exist and are reachable, but the handoff between them is unclear on a cold look — e.g. it's not obvious from the result screen alone whether a hint view costs XP (sprint-context.md's committed hint-tradeoff), or the distinction between `partial` and `fail` isn't legible without reading the copy closely (verdictHeader's neutral treatment for both, per SPEC.md, makes copy do the differentiating work — if the copy doesn't clearly do that, this is where it shows).
- **9:** All "Must" states are present and at least sketched "If time" states are considered, not silently dropped (empty/silent recording, garbled transcript, judge timeout, dropped network — Voice UX Reference marks these "If time," not "skip and don't mention"). The push-to-talk + explicit-send mechanic never implies auto-endpointing anywhere, even in copy. `statusNotice` vs `bottomSheet`'s `unsure` overlap (flagged in design-system.md as a real risk — "one treatment per screen") is resolved deliberately, not left ambiguous. Verified by actually triggering each state in the running prototype (or Storybook interaction), not by reading the component switch statement.

### Accessibility — weight: Medium

**What it's scoring:** Contrast, touch targets, and whether meaning ever rests on color alone — scored here as a *graded* dimension on top of the two items promoted to hard gates below (contrast and touch target pass/fail is binary; this dimension is about everything adjacent to those gates).

- **4:** A control's touch target is smaller than `Target/Minimum` anywhere, or a hint/verdict distinction is conveyed by color alone with no icon, shape, or copy backup (e.g. `partial` vs `fail` reading as "just a different tint" rather than differentiated by verdictHeader copy per SPEC.md). Placeholder text colored `text/disabled` (a documented, already-caught mistake in `chatInput` — 3.79:1, under the 4.5:1 minimum).
- **6:** Hard gates pass (contrast, touch targets) but accessibility wasn't actively designed for beyond that — e.g. a status notice's meaning would still be recoverable if colorblind, but only barely, or focus order/reading order wasn't checked for the sheet states (`bottomSheet`, hint layer) that lock the screen behind them.
- **9:** Every verdict and status state has a non-color signal (icon, copy, mascot expression) as the primary carrier of meaning, color as reinforcement only. Locked/scrim states (`lockBody`) verified not to trap keyboard or screen-reader focus behind the scrim. Verified with an actual contrast-ratio measurement tool and actual tap-target measurement on the rendered screen, not estimated from the token names.

### Structure — weight: Low

**What it's scoring:** Does the layout hold together as a layout, and does the thing actually render — the baseline "does it work" check, weighted low because it's necessary but not what distinguishes a good build from a great one here.

- **4:** Something doesn't render (build error, a screen crashes in Storybook, a component throws on a given variant combination), or the layout breaks at the target 390px viewport (overflow, clipped text, a `calloutBubble` stretched past its fixed 342px body).
- **6:** Everything renders cleanly at 390px with no layout breakage, but structure is achieved by one-off fixes rather than the documented scaffold (design-system.md's top/content/hint-layer/action-row/transient pattern) — it works, but not because it followed the pattern.
- **9:** Renders cleanly, composes from the documented scaffold pieces (`screen` shell's pinned top/scrolling middle/pinned bottom, `lockBody` used correctly for sheet-over-screen states), and holds up under the actual content lengths the copy will produce, not just the placeholder length. Verified by rendering at the real viewport, not by reading the JSX tree.

## Hard gates

These are separate from the weighted dimensions above — pass/fail, not scored 1-10. A failure on any gate is a blocking issue regardless of how the six dimensions score, since each one names a specific, checkable failure mode rather than a judgment call.

- **Contrast:** body text measures at least 4.5:1 against its background. Measure the actual rendered color pairing; a token name that sounds compliant (e.g. anything other than `text/disabled`, which is documented at 3.79:1 and explicitly excluded from body/placeholder use) is not itself proof.
- **Touch targets:** every interactive control's *hit area* is at least 44pt (`Target/Minimum`), even where the painted control is smaller (button S at 32px, Tertiary S/M's 20px line box, chatInput's 24px mic icon are named in design-system.md as painted-small-but-must-expand cases). Check the expanded hit area, not the visual box.
- **No raw hex in component source:** enforced by `npm run check:tokens`; it must run clean with zero reported lines before a build counts as done.
- **No two states that should differ rendering identically:** any pair of states the spec treats as distinct (idle vs. recording vs. processing; pass vs. partial vs. fail; `statusNotice` vs. `bottomSheet`'s `unsure`) must be visually distinguishable when actually rendered side by side — confirmed by screenshot comparison, not by confirming the underlying variant prop differs in code.
