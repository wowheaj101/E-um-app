Square multi-select control. Works controlled or uncontrolled; `onChange` receives the next boolean.

```jsx
<Checkbox label="전체 동의" defaultChecked />
<Checkbox checked={agree} onChange={setAgree} label="(필수) 이용약관 동의" />
```

- Omit `label` to use it standalone (e.g. in a list row). Use `size="sm"` in dense lists.
