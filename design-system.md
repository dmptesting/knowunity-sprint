# Design system rules

Companion to tokens/tokens.json. That file has the values. This file has the rules for reaching for them. No values are repeated here, only paths.

## Which component to reach for

**button** — a primary or secondary action with a short label (the file's own default is literally "1/2 words," treat that as a placeholder, not a length target). Real usage is almost entirely Primary/L. Don't put sentence-length copy in it.

**buttonIcon** — the same component, icon-only. Real usage is 100% Secondary. If you need a labeled AND icon-only version of the same action, that's two components, not one with the label hidden.

**buttonGroup** — a primary action paired with a secondary one, side by side. Every real instance is Horizontal/L holding one Primary + one Secondary button. Don't add a third button; the default slot shape is two.

**chips** — a short, 1-2 word tag, optionally with a side icon. Most real instances are still S/Primary/inactive with the placeholder text, so don't copy an existing chip instance as a content reference, copy its variant choice only.

**iconSlot** — never picked on its own. It's the thing nested inside every other component that needs an icon (165 real instances, the most-used piece in the file). Its `Size (IGNORE)` property is the file's own name for "don't touch this, it inherits from the parent." If you're placing an icon directly on a screen with no parent component around it, that's a sign you're missing a component, not a reason to drop in a bare iconSlot.

**mascotSlot** — Knowie, at a given size. Real usage favors 2XL/3XL. It wraps a nested `standby` instance; other mascot states may exist structurally but only `standby` has ever actually been used, so treat any other state as unverified until you see it on a real screen.

**progressIndicator** — a fixed step count (e.g. "term 3 of 12"), not a free-floating percentage. Real usage only exercises thickness=16 and progress 0-25. If you need a continuous, non-stepped progress feel, this isn't proven to support that.

**appBar, snackbar, textBlock** — zero real instances anywhere in the example screens. They're structurally complete (appBar has 6 variants and a content slot, snackbar embeds an iconSlot and a chip, textBlock pairs a title with an optional caption at 4 sizes) but nothing confirms how they actually look in a shipped screen. Reach for them if the scaffold needs a top nav bar, a transient message, or a title+caption pairing, but verify the result against the rest of the system yourself rather than trusting the variant grid alone. Note also: snackbar's embedded chip currently points at a chip variant name that no longer exists in the chips set. Don't copy that instance as-is.

## New components (added this sprint, not part of the original ten)

These six were designed and built into the file to support the voice-recall feature: none existed when the file was audited above, and none have real shipped-screen usage the way the original ten do. Each description below is quoted directly from the component's own `.description` field in Figma.

**voiceCircle** — component set, variant property `mode`: `idle` / `recording` / `processing`. No other properties.

> The animated circle that represents the AI's listening state during a spoken recall answer. Reach for it anywhere the student can speak: idle before they start talking, recording while their voice is being captured, processing while the answer is being evaluated. Don't reuse it as a generic loading spinner; its three modes are tied specifically to the voice-input lifecycle, not to loading states in general.

What each mode means: `idle` shows the halo and inner ring outlined in `accent/brand/bold` around a solid `accent/brand/bold` Core, with a centered mic icon — the student hasn't started speaking. `recording` keeps the same ring/Core treatment and swaps the mic for a 5-bar waveform in `accent/brand/onBold` — voice is actively being captured. `processing` keeps the ring/Core and swaps the bars for a single "Think dot" in `accent/brand/onBold` — the answer is being evaluated. One disclosed exception: the mic glyph inside `idle` is a plain vector, not a nested iconSlot instance, because no mic icon existed anywhere in the file's library before this sprint (see `mic`, below).

**x-close** — single component, no variants, no exposed properties.

> A close (X) icon for dismissing a sheet, modal, or banner. Swap it into a Button icon's iconSlot wherever the action is 'close this,' not 'go back.' Don't use it for back navigation; arrow-left is the icon for that, this one always means dismiss.

It's used like any other icon: swapped into a parent component's nested iconSlot, never placed or configured on its own.

**calloutBubble** — single component, no variants, no exposed properties.

> Knowie's speech bubble, used to present the mascot's spoken prompt or question as on-screen text. Reach for it anywhere the mascot is 'talking,' most often the recall question itself. Don't widen the Bubble past its fixed 342px body; long copy should wrap to a second line, not stretch the bubble out.

Structure is a Tail (a rotated polygon) plus a Bubble frame holding a Body text layer. The Bubble's width is a fixed value, not a token, matching the fixed body-text width convention already used elsewhere in the file (full screen width minus two side insets of `Space/600`). One Figma quirk worth knowing if you inspect the Tail: its four corner-radius fields are bound to `Radius/100`, but the polygon's own `cornerRadius` getter reports 0 — the binding doesn't appear to render on a POLYGON node the way it does on a RECTANGLE. That's a Figma limitation, not a broken binding.

**statTile** — single component, no variants, no exposed properties. Layers: `Label` + `Value`.

> A compact badge that surfaces a single numeric stat (XP earned, streak count, accuracy percent) tied to accent/blue. Reach for it inline after a recall attempt or on a summary screen when one number deserves emphasis. Don't use it for multi-line content or anything longer than a short label + short value; it isn't a card.

Fill `accent/blue/subtle`, stroke `accent/blue/bold`, radius `Radius/400`. Label uses `accent/blue/onSubtle`; Value uses `text/primary`. This one has real backing: it matches a real "Stat - XP" instance already in the file, fill/stroke/radius/text colors and text styles all confirmed against it. Its padding and internal gap don't have an exact real precedent (the real instance isn't built with auto-layout), so those two values were a confirmed judgment call, not a reverse-engineered one.

**hintCard** — single component, no variants, no exposed properties. Layers: `Label` ("Hint") + `Body`.

> A supportive hint surface for a recall question, shown when the student asks for help before or during their spoken answer. Reach for it inside the question bottom sheet. Don't use it to reveal the correct answer outright; it should nudge, not solve.

Fill `accent/brand/subtle`, radius `Radius/400`. Label uses `accent/brand/bold`; Body uses `text/primary`. Unlike statTile, this one diverges from its real precedent on purpose: the real "Hint" text on screen 08 floats directly on the bottom sheet's own background with no card at all. This card treatment is a deliberate new standalone version, confirmed rather than reverse-engineered — treat it the same way as appBar/snackbar/textBlock: structurally complete, not yet proven inside a real shipped composition.

**pathNode** — component set, two variant properties: `progress` (`completed` / `current` / `upcoming`) and `format` (`quiz` / `explainOutLoud`). No other exposed properties.

> A step in the study-plan learning path. Shows completion state (completed/current/upcoming) and which flow tapping it opens (quiz or explain-out-loud voice recall). Reach for it to build any path/roadmap list. Don't change its Label to anything longer than a lesson title; it isn't built to wrap.

What each `progress` value means: `completed` — Marker fill `accent/green/subtle`, no stroke, icon is always check-circle regardless of `format` (format stops mattering once the node is done). `current` — Marker fill `accent/brand/subtle` with a stroke in `accent/brand/bold`, icon shows the format icon; this is the "you are here" node. `upcoming` — Marker fill `background/surface`, no stroke, icon still shows the format icon. What each `format` value means: `quiz` swaps in the file's existing `ai-quiz` icon; `explainOutLoud` swaps in the new `mic` icon (below). The format icon is swapped through the same nested iconSlot instance every other component in the file uses, not through a property on pathNode itself. Format isn't shown on any real shipped node today — screen 01's real path only distinguishes format by label text — so this marker treatment is new and was confirmed rather than reverse-engineered. Ring size is 48 (`Space/1200`); the real reference ellipse is 46px with no matching token, snapped to the nearest real one.

**mic** — single icon component (not a full component, same class as the file's existing icons), no variants.

> The mic glyph used inside voiceCircle, promoted to a standalone icon so it can be swapped into any iconSlot (for example inside pathNode's explainOutLoud marker). Don't restyle its fill per-instance; it inherits text/primary like the file's other line icons.

## Scaffold

The recall loop's screens compose from these pieces; nothing in the file defines this as one locked template, so treat it as the pattern real usage implies, not a rule handed down from Figma:

- **Top:** appBar, when the screen needs navigation or a header action. Unproven (see above), so check it earns its place rather than adding it by default.
- **Content:** mascotSlot for Knowie plus the prompt copy (textBlock, or a bare text node bound to a real text style if textBlock's title+caption shape doesn't fit the state; calloutBubble if the prompt is meant to read as Knowie speaking rather than a plain heading). voiceCircle belongs here too for any state where the student is actively listening, recording, or being evaluated. progressIndicator sits here too when the state needs to show position in the session.
- **Hint layer:** this used to be an open gap — nothing in the original ten component sets was built specifically for a hint. hintCard now fills it (recall-loop-state-list.md's hint states 16 and 18). It's a new, unproven-in-context treatment though (see above), so check it reads as a hint and not as a generic card before shipping it.
- **Action row:** button alone for a single action, buttonGroup when it's a primary + secondary pair. buttonIcon when the action is icon-only, x-close specifically when that icon-only action is a dismiss. iconSlot nests inside all of these automatically, never placed beside them independently.
- **Transient:** snackbar for a message that appears and goes away. Unproven, and its default embedded chip is stale, so rebuild that part rather than duplicating the existing instance.
- **Outside the loop itself:** pathNode (the study-plan path/roadmap list) and statTile (a summary-screen stat) aren't part of this recall-loop scaffold — they belong to the surrounding study-plan screens the loop is launched from and returns to.

## Naming conventions

**Semantic color tokens** are four segments in principle, collapsed to two or three where a segment would be padding: `category/concept/role` or `category/concept/role/state`, e.g. `accent/brand/bold`, `interactive/primary/hover`. Concept has to be an actual concept (`brand`, `success`, `destructive`), never a color name. `accent/blue`, `accent/coral`, `accent/green`, `accent/magenta` still break this rule today; they're existing debt, not a pattern to extend. If you're adding a new accent, name it for what it means, not what it looks like, even if that means going back and fixing the hue-named ones eventually.

**Primitives** are `category/hue/step` for color (`color/violet/500`) or `category/step` for size and type (`Space/400`, `font/size/lg`). Primitives don't carry meaning, only value. Never invent a naming pattern for a primitive that implies a use case, that's what the semantic layer is for.

**Components and their variants** are camelCase for the component name (`buttonIcon`, `mascotSlot`) and the file's own vocabulary for variant values: `Primary/Secondary/Tertiary` for emphasis, `S/M/L` (or `XXS/XS/S/M` where finer steps exist) for size, `True/False` for booleans. Match whatever vocabulary the component you're extending already uses rather than introducing a new one for the same concept.

**Status or category variant axes get lowerCamelCase names and values, not Title Case.** This sprint's three new variant axes (`mode`, `progress`, `format`, with values like `idle`/`recording`/`processing` and `completed`/`current`/`upcoming`) are deliberately lowerCamelCase. Title Case in this file already means emphasis or size (`Primary`, `S/M/L`); reusing it for a status axis would collide with that meaning. Property names also avoid Figma's own reserved property-metadata words (`type`, `name`) and avoid overloading `state`, which already means interaction feedback (`Default/Pressed/Disabled/Loading`) elsewhere in the file.

**Standalone icons use the file's existing icon vocabulary — kebab-case, or a single lowercase word — never camelCase.** `x-close` and `mic` follow the same pattern as the file's own `arrow-left`, `check-circle`, and `ai-quiz`. camelCase is reserved for components made of more than one part; a single icon isn't one.

**New icons carry their own default fill baked in, the same way the file's existing icons do.** Most default to `text/primary` (`ai-quiz`, `mic`); some intentionally bake in a specific color regardless of context (`check-circle` uses `text/link` even against a green marker). Don't expect a parent component to recolor an icon per instance; give it the right default fill when you build it.

**A component that needs a swappable icon nests the file's existing iconSlot, it doesn't invent a new instance-swap property.** Clone a real iconSlot usage from an existing instance, then set its `Instance#...` property to the target icon's main component. This is how pathNode's Marker and x-close's demo instance both work, and it's the same mechanism the original ten components already use — see the `iconSlot` entry above.

**Combining multiple variant components into a set is name-driven.** Before calling combine, each source component must be named exactly `propertyName=value`, comma-separated for a second axis (e.g. `progress=completed, format=quiz`) — the variant property and its options come directly from parsing that string.

**Every value is bound to a real token before a component counts as finished.** If nothing in tokens/tokens.json matches exactly, snap to the nearest real token and disclose the substitution rather than leaving a raw pixel value — this happened twice this sprint (voiceCircle's internal icon geometry, pathNode's 48px ring standing in for a 46px real reference).

**A finished component has a written `.description` before it's considered done.** Three of this sprint's six (voiceCircle, x-close, calloutBubble) shipped without one and it went unnoticed until this file was written — write the description as the last step of building the component, not as separate cleanup afterward.

**In tokens/tokens.json specifically**, the same names become dot paths (`accent.brand.bold`) and the type scale is camelCase keys (`displayL`, `headlineXsBold`) instead of the Figma text style's `Greed/Display L` naming, since JSON object keys don't take spaces or slashes well. One deviation worth knowing: `interactive.primary`, `.secondary`, and `.destructive` are each both a token and the parent of a hover/active pair in Figma. JSON can't let a token double as a group, so those six became `interactive.primaryHover` / `interactive.primaryActive` etc. in the export. That's a file-format workaround, not a naming convention to copy into Figma.

**Text-style tracking is percent in Figma, and Figma can only bind it as pixels.** All 19 text styles set letterSpacing as a percent of font size: −1% for Display L/M/S and Headline XL/L/M, 0% for Headline S, +1% for everything smaller. `font/tracking/tight`, `none` and `loose` hold exactly those numbers (−1 / 0 / 1). But binding a number variable to a text style's letterSpacing makes Figma apply it in pixels, so +1% becomes 1px, about 6.7× wider on 15px body text. The styles therefore stay deliberately unbound, with the percent typed in. That's a Figma limitation, not a missing binding to go back and fix. In tokens.json each `textStyle` references its tracking token (`"letterSpacing": "{font.tracking.loose}"`), and code converts it with `calc(var(--number-font-tracking-loose) * 0.01em)`, since 1% of the font size is 0.01em.

## Structure conventions

**Every new component lives in its own "Component Container" frame** (a white frame holding a title text naming the component, then the component or set itself), stacked on the "🎨 Mascot & components" page. This is a staging convention for finding things on that page later, not a rule about a component's own internal structure — don't read a Component Container as part of the shipped design.

**Internal layer names are Title Case, with a plain descriptive word or two** (`Marker`, `Label`, `Value`, `Body`, `Tail`, `Bubble`, `Ring — halo`), matching the file's existing internal naming (`Icon Slot`, `Panel Header`). An em dash separates a shared base name from a variant of it (`Ring — halo` vs `Ring — inner`).

## Never do this

**Never invent a value that isn't in tokens/tokens.json.** If the token you need doesn't exist (there's no `feedback/info/*` family right now, for instance), say that it's missing and ask, don't pick a nearby hex and move on.

**Never use a CSS fallback like `var(--token, #333)`.** If a token resolves to nothing, that's a broken reference to fix at the source, not a value to paper over in code.

**Sentence case on every label, button and heading.** Capitals only for proper nouns (Knowie, Knowunity). The file's own default button copy ("Check") already follows this; don't let Title Case creep in on new strings.

**Never put an appearance word in a semantic name.** If the word describes what a color looks like (blue, coral, gold) rather than what it means (brand, success, destructive), it belongs in the primitive layer only. `accent/brand` is the model to follow; `accent/blue` is the mistake already in the file, not a precedent.

**Never read a primitive directly.** Every component consumes the semantic layer; the semantic layer is the only thing that references a primitive. If you catch yourself binding a fill straight to `color/violet/500` instead of `accent/brand/bold` or whichever semantic token fits, that's a broken layer, not a shortcut.

**Never trust that a matching literal value means something is actually bound.** A swatch, a text node, or a spacing value can display the right number while still being a hardcoded literal underneath. Check the actual binding (the Fill panel, the Selection colors panel, or `boundVariables` in code) before treating a value as wired to a token. This file has had three separate cases of that exact gap. Text-style tracking looks like a fourth but isn't: those styles are unbound on purpose, because Figma can't bind them without switching to pixels (see the tracking note under Naming conventions).

**Never leave a gap, padding, or radius at a number that isn't a real token step.** If the spacing you want falls between two `Space/*` values, snap to the nearest real one and bind it, don't leave an untracked pixel value sitting next to tokens that are all real steps.

**Never treat appBar, snackbar, or textBlock's variant grid as proof of how they're meant to look.** Zero real instances exist for any of the three. Build with them, then check the result, don't assume the structure alone is validated. The same caution now applies to hintCard and pathNode's format-icon marker: both are new and unproven in a real shipped composition.

**Never ship a component still showing its default placeholder text** ("1/2 words," "0/12," snackbar's two-line placeholder) as if it were real content. Most chip instances in the file today still do this; it's a known gap, not a model.

**Never colour placeholder text with `text/disabled`.** A disabled control is exempt from WCAG 1.4.3; an empty field's placeholder is ordinary text and is not. `text/disabled` measures 3.79:1 on `background/input`, under the 4.5:1 minimum, so placeholders take `text/secondary` (7.72:1) instead. The token's description in tokens.json says so — chatInput was the one place that had it wrong.

**Never let a control's touch target fall below `Target/Minimum` (44px).** Several of Figma's painted sizes are smaller — button S is 32px, Tertiary S/M collapse to a 20px line box, and the chatInput mic is a 24px icon box. Match the drawing, then expand the *target* with a transparent centred `::after` sized `max(100%, var(--dimension-target-minimum))`. Never resize the painted box to hit the number, and never leave the gap unfixed because the file draws it that way.

**Never finish a component without writing its description.** Three of this sprint's six shipped without one; see Naming conventions above.
