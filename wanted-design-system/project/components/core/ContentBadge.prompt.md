Inline categorical label for job type, status, deadline, or recruiter notes. Tinted by default; go `solid` for emphasis.

```jsx
<ContentBadge tone="blue">정규직</ContentBadge>
<ContentBadge tone="red" variant="solid">D-3</ContentBadge>
<ContentBadge tone="green">합격</ContentBadge>
<ContentBadge tone="neutral">스타트업</ContentBadge>
```

- Tones map to the accent foreground/background token pairs — keep one tone per meaning across a screen.
- Use `solid` sparingly (deadlines, alerts); `weak` is the workhorse.
