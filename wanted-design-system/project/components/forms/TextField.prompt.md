Labeled text input for forms and search. Focus shows a primary ring; pass `error` to flip it to the invalid state.

```jsx
<TextField label="이메일" placeholder="name@example.com" type="email" />
<TextField placeholder="검색어를 입력하세요" leading={<Icon name="search" size={20} />} />
<TextField label="비밀번호" type="password" error="8자 이상 입력해주세요" />
```

- `helper` shows muted assistive text; `error` replaces it and turns the field red.
- `leading`/`trailing` accept any node — commonly an `<Icon/>` or a small `<Button/>`.
