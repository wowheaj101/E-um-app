Circular single-select. Drive a group by holding the selected value in state and comparing per option.

```jsx
{["1~3년","4~7년","8년+"].map(v => (
  <Radio key={v} label={v} value={v} checked={exp === v} onChange={setExp} />
))}
```

- `onChange` is called with the radio's `value` when it becomes selected.
