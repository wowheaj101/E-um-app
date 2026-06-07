Renders a Wanted UI icon from the 24px library; use anywhere a glyph is needed (buttons, list cells, nav, status).

```jsx
<Icon name="search" />
<Icon name="bookmark" size={20} color="var(--primary-normal)" />
<Icon name="bell" title="Notifications" />
```

- Glyphs paint with `currentColor` — set `color`, or just let it inherit the text color of its container.
- `size` scales the whole 24px grid uniformly (common: 16 / 18 / 20 / 24).
- Pass `title` to make it an accessible image; omit for decorative icons.
- Full set in `ICON_NAMES`: home, search, bookmark, bell, person, message, heart, plus, share, setting, filter, location, pin, clock, coins, calendar, chevronDown/Left/Right, check, close, circleCheck, circleInfo, circleExclamation, triangleExclamation, trash, globe, squareMore.
