Underline tabs for primary page sections (홈 / 채용 / 커리어). Each item may carry a `count`.

```jsx
<Tabs
  items={[{value:"applied",label:"지원",count:12},{value:"saved",label:"저장",count:34}]}
  value={tab} onChange={setTab}
/>
<Tabs fullWidth items={[...]} defaultValue="home" />
```

- Use `fullWidth` for 2–3 tabs that should split the bar; default spacing suits a left-aligned row.
