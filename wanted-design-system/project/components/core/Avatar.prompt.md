Company or person image. Rounded-square for companies (the Wanted default in job lists), circle for people.

```jsx
<Avatar src={logoUrl} name="토스" />
<Avatar shape="circle" name="김원티드" size="sm" />
<Avatar size={64} src={logoUrl} alt="회사 로고" />
```

- No `src` → shows the first letter of `name` on a grey fill.
- Pass a number to `size` for off-scale dimensions.
