Base surface for grouped content (job cards, settings panels, sheets). Defaults to a hairline-bordered flat card.

```jsx
<Card>
  <h3 className="wt-headline1">맞춤 공고</h3>
  <p className="wt-body2">관심 직군에 딱 맞는 포지션이에요.</p>
</Card>
<Card elevation="raised" interactive onClick={open} />
```

- Use `flat` (border) for in-page cards, `raised`/`floating` for overlays and hover-lift cards.
