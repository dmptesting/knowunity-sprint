@AGENTS.md

# knowunity-sprint

Mobile-only (iOS, 390px, dark mode) design prototype for a voice-based active-recall step in Knowunity's exam plan: student explains a concept out loud, Knowie judges in text. Recall/STT/judging are mocked, not real.

## Hard rules (always true)

- Follow sprint-context.md's committed concept and decisions exactly — it overrides the Design Brief wherever the two disagree (e.g. question count).
- Voice in, text out. Knowie never speaks.
- Push-to-talk with explicit send. No auto-endpointing, ever.
- Recall only — no conversation branching on off-topic speech.
- Every required action needs a way out (skip, text fallback, or save-and-resume). Never trap the student.
- Build only the screens/states in the Voice UX Reference's "States to design" table. Must-column first, If-time sketched, Out-of-scope noted not built.
- Use only components documented in design-system.md, bound to real tokens.json values. No ad hoc components, no raw hex/pixel values.
- Sentence case on every label/button/heading (proper nouns excepted).

## Never

- Never give Knowie a voice/audio output.
- Never add auto-detection of when someone stops talking.
- Never invent a component not in design-system.md, or a token not in tokens.json.
- Follow design-system.md's "Never do this" list (token fallbacks, unproven components, etc.) — don't relearn it here.
- Follow sprint-context.md's "Not building" list — don't relearn it here.

## File map

- `AGENTS.md` — Next.js-version rules for this repo; read before writing any Next.js code.
- `sprint-context.md` — settled scope for this sprint. Read first, always.
- `Design Brief *.md` — the original brief: problem, constraints, mandate, open questions. Read before any product/UX call not already settled in sprint-context.md.
- `Voice UX Reference *.md` — voice-UX principles and the states-to-build checklist. Read before designing or building any recall-loop screen.
- `design-system.md` — which component to reach for, naming/token-binding rules, what's proven vs unproven. Read before placing or naming any component.
- `tokens.json` — the token values design-system.md points at. Look up a value here; never hardcode one.
- `reference/*.PNG` — screenshots of Knowunity's shipped beta. Check when a screen's behavior isn't settled elsewhere.
- `public/images/*.svg` — Homie mascot expression states; only `standby` has real shipped usage (design-system.md).
- `app/` — the actual prototype code. Currently unmodified create-next-app scaffold (stock page/layout/logos) — replace, don't extend.
- `public/{next,vercel,globe,file,window}.svg` — stock create-next-app assets, dead once `app/page.tsx` is rebuilt.
- `.claude/skills/` — ux-designer, ui-designer, ux-motion, interactive-prototype.
