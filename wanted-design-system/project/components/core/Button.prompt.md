Primary action control — use for form submits, CTAs, and confirmations; pair `variant` (fill weight) with `tone` (intent).

```jsx
<Button>지원하기</Button>
<Button variant="weak" tone="primary">관심 등록</Button>
<Button variant="outline" tone="neutral" leadingIcon={<Icon name="share" size={18} />}>공유</Button>
<Button tone="negative" variant="text">삭제</Button>
<Button fullWidth size="lg">다음</Button>
```

- `variant`: solid (filled) · weak (tinted) · outline (hairline) · text (bare). `tone`: primary · neutral · negative.
- `size`: lg / md / sm (48 / 40 / 32 px tall). Use lg for full-width mobile CTAs.
- Hover darkens, press darkens further — handled internally. Pass `leadingIcon`/`trailingIcon` an `<Icon/>`; `fullWidth` stretches it.
