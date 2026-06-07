# Wanted Design System

A working design system for **Wanted** (원티드) — the Korean
recruitment & career platform operated by **Wanted Lab (원티드랩)**.
Wanted connects job-seekers and companies through referral-based hiring
("지인 추천"), an AI matching feed, résumé tooling, and a professional
community. The system here is reconstructed from the official
*Wanted Design System* Figma library and packaged so design agents can
build on-brand Wanted interfaces and assets.

> **Brand family in scope.** The Figma logo page ships marks for the
> masterbrand **Wanted** plus sub-products **Wanted Space**, **Wanted
> Gigs**, **Wanted Agent**, **LaaS** (hiring API), and **Wanted OneID**.
> This package focuses on the masterbrand; sub-brand wordmarks can be
> added to `assets/logos` as needed.

## Source
- **Figma:** "Wanted Design System (Community)" — attached `.fig`
  (pages: Color Atomic/Semantic, Typography, Grid, Spacing, Logo, Icon,
  Theme, Components, Work/채용 sample screens, …). All tokens, the type
  scale, the icon geometry, and the logo vectors were extracted from it.
- No codebase was provided; product screens are grounded in the Figma
  "Work / 채용" mobile frames (375pt).

---

## Content fundamentals

Wanted's product voice is **Korean-first, warm, and quietly confident** —
it speaks to ambitious professionals without hype.

- **Language:** Korean UI copy, with English/loanwords woven in naturally
  for job titles and tech ("프론트엔드 개발자 (React)", "그로스 마케터").
  Japanese is also supported (Pretendard JP) for cross-market postings.
- **Address:** Speaks *to* the user gently in 해요체 — friendly-polite,
  not formal 합니다체 and not casual. e.g. "압도적인 동료를 찾습니다",
  "지원서가 제출되었어요", "최근 일주일 312명이 지원했어요".
- **Tone:** Encouraging and outcome-oriented — leads with the user's
  upside ("합격 가능성 높은 포지션", "합격보상금 100만원",
  "합격을 부르는 이력서"). Money/benefit incentives are stated plainly.
- **Casing:** English follows Title/Sentence case naturally; no SHOUTING.
  Numerals are Arabic ("경력 3~7년", "D-5", "200명").
- **Brevity:** Labels are tight noun phrases; section headers are short
  human sentences ("테마로 살펴보는 포지션", "설립 10년 이상 포지션 어때요?").
- **Emoji:** Not used in core product chrome. The visual accent is the
  gradient symbol and color, not emoji.

---

## Visual foundations

**Overall feel.** Clean, bright, information-dense but breathable. White
canvas, near-black text, a single confident blue, and lots of hairline
structure. It reads like a modern Korean super-app: lots of cards and
horizontal rails, generous rounded corners, minimal ornament.

- **Color.** One brand blue — **Wanted Blue `#0066FF`** (`--primary-normal`)
  — does almost all the accent work. Neutrals are a *cool* grey ramp
  (slightly blue-leaning: `#F7F7F8 → #171719`). Status = green
  `#00BF40` / red `#FF4242` / orange `#FF9200`. A wider accent palette
  (violet, cyan, pink, lime…) is reserved for content badges and
  illustration. Text uses **alpha-on-grey** label tokens (88/61/28/16%)
  rather than separate greys, so it sits correctly on any surface.
- **Typography.** **Pretendard JP** everywhere (KR/EN/JP). A precise
  7-tier / 18-step scale (Display → Caption) with negative tracking on
  headings and slightly *positive* tracking on small text. Body copy is
  **Medium (500)**, headings **Bold (700)**, with a dedicated "reading"
  line-height for paragraphs. See `guidelines/type-*`.
- **Backgrounds.** Predominantly solid white (`--background-normal`) with
  a faint cool-grey alternative (`#F7F7F8`) for grouped/section breaks
  (note the 8px grey spacer between detail sections). No gradients in
  chrome — the *only* gradient is the brand symbol (blue→pink→orange).
- **Shape & radius.** Friendly, generous rounding that scales with size:
  6–8px on chips/badges, 10–12px on controls, 16px on cards, 20px on
  sheets, full pills on chips-as-tags and avatars-as-people. Company
  avatars are **rounded squares**; people are **circles**.
- **Borders vs shadows.** Structure comes from **hairline borders**
  (`--line-normal`, grey @ 22%) and **translucent fills** (`--fill-normal`,
  grey @ 8%) far more than from shadows. Shadows exist but are *tight and
  low-alpha* (`--shadow-card` ≈ 1–3px, 4–6% black), reserved for raised
  cards, popovers, modals. Flat cards use a border, not a shadow.
- **Interaction.** Hover/press **darken** via token swaps (solid buttons
  step `normal → strong → heavy`; ghost controls reveal a grey fill
  overlay). No scale-bounce on buttons. Selection (chips, segmented,
  tabs) shifts to **primary tint bg + primary hairline + primary text**.
  Focus on inputs = primary border + a soft 3px primary-tint ring.
- **Motion.** Quick and calm: 120–320ms, standard ease
  `cubic-bezier(.4,0,.2,1)`; the segmented-control knob and switch use an
  emphasized ease. Fades/slides, never bouncy. Respect reduced-motion.
- **Layout.** Mobile-first (375pt), 20px side gutters, 28–48px vertical
  section rhythm, horizontal scroll rails for "more like this" content.
  Responsive container caps at 1060px on web.
- **Imagery.** Company logos on tinted/solid brand-color tiles; warm,
  bright, optimistic photography when used. Content leads with text +
  badges, not stock imagery.

---

## Iconography

- **Set.** A bespoke **24px grid** icon family extracted from the Figma
  icon library — geometric, rounded terminals, medium weight, rendered as
  **filled vectors that paint with `currentColor`**. Both line and a few
  filled variants exist in Figma; this package ships the line set.
- **Delivery.** A single React `Icon` component (`components/icons/Icon.jsx`)
  with the real path geometry baked in — **not** an icon font and not a
  CDN set. 28 glyphs cover the core product surface (home, search,
  bookmark, bell, person, message, heart, plus, share, setting, filter,
  location, pin, clock, coins, calendar, chevrons, check, close, the
  circle status family, triangle-exclamation, trash, globe, squareMore).
- **Usage.** Size in multiples of the 24-grid (16/18/20/24); recolor by
  setting `color` or letting it inherit text color. Add new glyphs by
  dropping `{ x, y, p:[[d, fillRule]] }` entries into `Icon.jsx`.
- **Emoji / unicode:** not used as iconography anywhere in the system.

---

## What's in here (manifest)

**Foundations**
- `styles.css` — root entry (import this); `@import`s the tokens below.
- `tokens/fonts.css` — Pretendard JP via jsDelivr dynamic-subset CDN.
- `tokens/colors.css` — atomic ramps + semantic tokens (light + dark).
- `tokens/typography.css` — font vars + 18-step scale + `.wt-*` classes.
- `tokens/spacing.css` — spacing, radius, elevation, layout, motion.

**Components** (`components/…`, React; consume via `window.WantedDesignSystem_3ed5bb`)
- `icons/Icon` — 24px currentColor icon set.
- `core/` — Button, IconButton, Chip, ContentBadge, Badge, Avatar.
- `forms/` — TextField, Checkbox, Radio, Switch.
- `navigation/` — Tabs, SegmentedControl.
- `feedback/` — Toast.
- `display/` — Card, ListCell.

**Guidelines** (`guidelines/*.card.html`) — Design-System-tab specimens for
color, type, spacing, radius, elevation, and the logo.

**UI kit** (`ui_kits/wanted/`) — interactive iOS recreation of the Wanted
jobs feed → job detail → apply flow. Open `index.html`.

**Brand** (`assets/logos/`) — `wanted-wordmark.svg` (recolorable),
`wanted-symbol.svg` (gradient mark), `wanted-symbol-mask.svg` (mono
geometry), `wanted-symbol-fill.png`.

**Skill** — `SKILL.md` makes this usable as a Claude Agent Skill.

---

## Caveats
- **Fonts:** Pretendard JP loads from the official jsDelivr CDN. **Wanted
  Sans** (the masterbrand display face, used only for the wordmark, which
  ships as vector) currently falls back to Pretendard JP for live text —
  add real `@font-face` rules to `tokens/fonts.css` if you self-host it.
- Company logos in the UI kit are initial avatars (no real logos shipped).
- Sub-brand wordmarks (Space, Gigs, Agent, LaaS, OneID) are not yet
  extracted — only the masterbrand Wanted logo is included.
