List row for menus, settings, and resource lists. Compose leading/trailing with other primitives.

```jsx
<ListCell
  leading={<Avatar name="토스" />}
  title="프론트엔드 개발자"
  description="토스 · 서울 강남구"
  trailing={<Icon name="chevronRight" size={20} />}
  onClick={open}
  divider
/>
<ListCell title="채용 알림" trailing={<Switch defaultChecked aria-label="채용 알림" />} />
```

- Provide `onClick` to make it tappable (adds hover fill + button semantics). Use `divider` between stacked rows.
