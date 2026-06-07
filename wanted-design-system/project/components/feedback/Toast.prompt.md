Brief confirmation or alert on a dark inverse surface. You own the show/hide + auto-dismiss; this renders the pill.

```jsx
<Toast status="positive" action="보기" onAction={open}>지원서가 제출되었어요</Toast>
<Toast status="negative">네트워크 오류가 발생했어요</Toast>
<Toast>저장되었습니다</Toast>
```

- `status` auto-picks the icon (positive/negative/info). Keep messages to one line; one action max.
