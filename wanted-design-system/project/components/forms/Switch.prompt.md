Instant on/off toggle for settings that apply immediately (notifications, visibility). Not for forms that need a submit.

```jsx
<Switch defaultChecked aria-label="채용 알림" />
<Switch checked={pushOn} onChange={setPushOn} />
```

- Always supply `aria-label` when there's no adjacent text label.
