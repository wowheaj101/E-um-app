Icon-only button for dense surfaces (top bars, card corners, toolbars). Always pass `aria-label`.

```jsx
<IconButton icon={<Icon name="bookmark" />} aria-label="저장" />
<IconButton icon={<Icon name="search" />} variant="solid" tone="primary" aria-label="검색" />
<IconButton icon={<Icon name="close" size={20} />} size="sm" aria-label="닫기" />
```

- `variant` defaults to `text` (transparent, fill on hover). Use `solid` for a primary FAB-like action.
- `size` sets the square target: lg 48 / md 40 / sm 32.
