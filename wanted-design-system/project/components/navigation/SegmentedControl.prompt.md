Compact switch for 2–4 mutually exclusive views (e.g. 추천 / 최신, 전체 / 진행중). Use `Tabs` instead when there are many sections or they carry counts.

```jsx
<SegmentedControl
  items={[{value:"reco",label:"추천"},{value:"new",label:"최신"}]}
  value={sort} onChange={setSort}
/>
<SegmentedControl fullWidth items={[...]} defaultValue="all" />
```
