---
name: build-screen
description: "Applies when building or editing any screen or screen state in this voice-recall prototype — the recall loop, the entry and primer screens, the summary, the abandon sheet, or any state listed in SPEC.md. Triggers on: 'build the reveal screen', 'build the primer', 'the fail state', 'the text fallback turn', 'cancel and re-record', 'status notices', 'edit screen 03', 'make the processing state', or any request naming a screen, a state, or a numbered Figma frame in this project. Use it for composing screens from the component library; it does not apply to building library components in isolation, changing tokens, or editing the Figma file."
---

# Building a screen in this prototype

Screens here are **compositions**, not new components. The component library is the
only vocabulary. Most of the Figma library was never built in code, so Figma is
reference, not a source of parts.

Mobile only: 390px, dark mode, iOS. Sentence case on every label, button and heading
(proper nouns excepted — Knowie, Knowunity).

---

## 1. Read SPEC.md first

`SPEC.md` is the settled spec. Find the screen under **Per screen** and take from it:
its state list, its components with their exact variants, and what the student can do.
Build **every** state listed, including the failure ones — a screen with its happy path
done is not done.

`SPEC.md` overrides the Figma file wherever they disagree. It also overrides
`Design Brief 5946279147098382bcf481e214d50609.md`, and `sprint-context.md` overrides
the brief.

## 2. Check whether the screen has a Figma frame

Frames live in **Module 5 — Flow Screens**, node `13543:10784`, on the
`Strategy:Research • Inspo • User Flows` page of `Yummy__Knowie Design System`
(file key `Q1DGK9XmPMBQqEriDIHwzf`). Read one with `figma_execute` or
`figma_get_file_data`; call `figma_list_open_files` first, since node IDs go stale
between sessions.

| SPEC screen | Figma frame | What that means |
|---|---|---|
| Reveal | none | Design it |
| Result sheet: pass | `06 — Correct answer` | Reference only — the verdict is `bottomSheet` over the turn, not 06's full screen (SPEC.md screen 2) |
| Result sheet: partial | `07 — Miss, hint offered` | Reference only — same sheet as fail, title "Almost…"; 07's lines are the copy source |
| Result sheet: fail | none | Same sheet as partial, title "Not quite…" |
| Entry + mic primer | `02 — Entry, tapped the node` | Match the frame; the primer copy is new |
| Permission denied | none | Design it |
| Skip | n/a | `AppBar`'s `rightCTA`; the header is drawn in 03–08 |
| Text fallback turn | none | Design it |
| Status notices | none | Design them |
| Cancel & re-record | `04 — Recording, listening` | Match it; the armed-to-cancel phase is new |
| Idle / recording / processing | `03` / `04` / `05` | Match them |
| Summary | `09 — Session complete, results` | Match it, except the count (see below) |
| Abandon sheet | `10 — Close tapped, abandon confirmation` | Match it; the typing swap is new |

**If it has a frame:** match it, then list every difference between what you built and
the frame when you finish.

**If it doesn't:** read `Voice UX Reference 4fe62791470982779c32813df9bbf0c5.md` for how
the state should behave — its six principles and the states-to-design table — and the
Design Brief for the F-numbers. When you finish, tell the user what you had to decide
that wasn't written down anywhere.

### Where the frames are known to be wrong

Do not copy these. `SPEC.md` wins:

- `09` reads `CORRECT 4/5`. The session is **4 questions**. Build `x/4`.
- `03`, `04`, `05` instantiate a local `Voice circle (invented)` set (variant `state`,
  node `13543:10832`). The real component is `voiceCircle` (variant `mode`, node
  `13558:14306`).
- `07`'s buttons read "Try Again" / "View Hint". Sentence case: "Try again" / "View hint".
- `08` floats hint text with no card. `HintCard` exists in code; use it.
- `09` builds stats as hand-drawn frames. `StatTile` exists; use it.
- `02`, `03` use bare text where `CalloutBubble` belongs when Knowie is speaking.

## 3. Query Storybook for every component you will use

Before writing any JSX, call `docs-list` once, then `docs-show` for each component.
**Never assume a prop exists**, including obvious-sounding ones. If a prop is not in the
docs or shown in a story, it does not exist — stop and ask rather than inventing it.

Props that are easy to get wrong here:

- `Button`'s label is `CTA`, not `label` or children.
- `ButtonGroup` holds exactly **two** actions: `primaryCTA` + `secondaryCTA` (Vertical),
  or `primaryCTA` + `secondaryIcon`/`secondaryLabel` (Horizontal). Never a third.
- `AppBar` renders its slot content as `children`. The recall header is
  `variant="leftAndRightButton"`, `leftIcon={<CloseIcon />}`, `leftLabel="Close"`,
  `rightCTA="Skip"`, wrapping `ProgressIndicator` `thickness="16"` — see
  `AppBar.stories.tsx`, "Real usage — the recall header".
- `ProgressIndicator`'s `progress` is a string union `'0'|'25'|'50'|'75'|'100'`, and
  `showText` works only at `thickness="24"`.
- `HintCard` and `CalloutBubble` each take only `body`.
- `MascotSlot` takes `size` and `expression`; `label` defaults to decorative.
- `CalloutBubble` is **Knowie speaking**. Never put the student's words in it.

## 4. Compose from Storybook only

The 13 components in `app/_components/` are the entire vocabulary. Import them by
relative path — there is no barrel file, and the `from 'knowunity-sprint'` in Storybook's
generated docs does not resolve.

Do not reach for a Figma component that has no React build. `textBlock`, `snackbar`,
`chips`, `iconSlot`, the `scaffold` and the `Status Bar` are all in Figma and **not** in
code.

## 5. When something you need isn't in Storybook

Check `component-gaps.md` first.

- **Not on the list:** build it inline inside the screen, from tokens. Add one line to
  `component-gaps.md` naming what it was and which screen needed it. Keep going — do not
  stop to ask.
- **Already on the list from another screen:** that is the second sighting. Build it
  properly now — its own directory under `app/_components/`, with a `.module.css`, a
  `.stories.tsx` covering its states, and a written description. Then replace the inline
  copy in the earlier screen and strike the line from `component-gaps.md`.

## 6. Every value from the generated tokens

`build/css/tokens.css` is generated from `tokens/tokens.json` by `npm run tokens`.
**Never edit `tokens.css` by hand.** If a token is missing, edit the source and
regenerate — or say it's missing and ask.

- No raw hex, no raw px. `var(--color-*)`, `var(--dimension-space-*)`,
  `var(--dimension-radius-*)`, `var(--number-opacity-*)`.
- No CSS fallbacks — `var(--token, #333)` is a broken reference papered over.
- Never read a primitive directly. Semantic layer only: `accent/brand/bold`, never
  `color/violet/500`.
- A `feedback/*` family exists (success, error, warning — each bold/onBold/subtle/onSubtle).
  Per SPEC, `feedback/success/subtle` goes behind a pass only; no error or warning panel
  behind a miss.
- Touch targets never below `--dimension-target-minimum` (44px). Match the painted size,
  then expand the target with a transparent centred `::after` sized
  `max(100%, var(--dimension-target-minimum))`.
- Placeholder text takes `text/secondary`, never `text/disabled`.
- Type tracking converts as `calc(var(--number-font-tracking-*) * 0.01em)`.

## 7. Stories and tests

Every screen state gets a story. The glob is `app/**/*.stories.tsx`, so stories live
beside the screen. Follow `get-storybook-story-instructions` before writing them.

Run tests with the Storybook MCP's `test-run` — never a package.json test script. Then
`stories-preview` and include every returned URL in your final message. Tests run in
headless Chromium via Playwright, so anything touching `getUserMedia` needs an injectable
seam the story can stub.

## 8. Known traps in this codebase

- `useSearchParams` (the `?verdict=` dev control) must sit inside a `<Suspense>` boundary
  or it errors during prerender. Every library component is `'use client'`.
- `app/globals.css` may still carry the create-next-app scaffold (`--background: #ffffff`
  and a `prefers-color-scheme` block). This prototype is dark-only — if it is still there,
  fix it before trusting anything you see under `next dev`.
- `AGENTS.md`: this Next.js version has breaking changes. Read
  `node_modules/next/dist/docs/01-app` before creating any route.
- Never add auto-endpointing. Push-to-talk with explicit send, always.
- Never give Knowie audio output.
- Every required action needs a way out — skip, text fallback, or save-and-resume.

## Finish by reporting

1. Which states you built, and confirmation that the failure ones are among them.
2. **If the screen had a frame:** every difference between your build and the frame.
3. **If it didn't:** every decision you made that wasn't written down anywhere.
4. Anything added to `component-gaps.md`, or promoted off it into a real component.
5. Any token you wanted that doesn't exist.
6. `stories-preview` URLs and `test-run` results.
