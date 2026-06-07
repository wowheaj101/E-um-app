Unread indicator for icons, tabs, and avatars — a dot or a capped count.

```jsx
<Badge dot />
<Badge count={5} />
<Badge count={128} tone="primary" />   {/* shows 99+ */}
```

- Position it absolutely over the host (top-right). The 2px ring matches the surface so it reads cleanly on any background.
