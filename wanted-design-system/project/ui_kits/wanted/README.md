# Wanted — Jobs App (UI kit)

A high-fidelity, interactive recreation of the **Wanted** mobile jobs
experience (iOS), built entirely from this design system's primitives.

## Files
- `index.html` — runnable prototype (open it). Loads `_ds_bundle.js` for
  the DS components, then the screen files below.
- `data.js` — mock jobs, shortcuts, theme tags (`window.WANTED_*`).
- `TopBar.jsx` — GNB with the real Wanted wordmark + search/bell.
- `JobCard.jsx` — the signature posting card (`grid` rail card / `row` list card).
- `HomeScreen.jsx` — feed: shortcuts · filter chips · high-match rail · theme grid · recommended list.
- `JobDetailScreen.jsx` — posting detail with sticky apply bar.

## Interactions
- Tap any job → detail screen → **지원하기** fires a success Toast and returns to the feed.
- Bookmark toggles on cards and in the detail apply bar.
- Bottom tabs switch sections (홈 is built out; others are placeholders).
- Filter chips are live; the high-match rail and recommended list scroll.

## Composition notes
Primitives come from `window.WantedDesignSystem_3ed5bb` (Button, IconButton,
Chip, ContentBadge, Avatar, Card, Toast, Icon). Product-specific pieces
(JobCard, TopBar, the iOS shell) are composed locally — they are
cosmetic recreations, not production code. Company marks are initial
avatars; swap in real logos by passing `src` to `Avatar` / the card.

Layout and content mirror the Figma "채용" (jobs) mobile frame: 375pt
width, 20px gutters, 28–48px section rhythm, horizontal card rails.
