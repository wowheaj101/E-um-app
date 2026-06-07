Filter or single-choice token, typically in a horizontal scroll row. Toggle `selected` to fill it with a primary tint.

```jsx
<Chip selected>전체</Chip>
<Chip leadingIcon={<Icon name="location" size={14} />}>서울</Chip>
<Chip trailingIcon={<Icon name="chevronDown" size={14} />}>경력</Chip>
```

- Default size `sm`; use `xs` for dense metadata rows, `lg` for prominent filter bars.
- Pair with React state to make a toggle group; selected chips read with `aria-pressed`.
