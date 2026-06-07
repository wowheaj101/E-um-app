/* HomeScreen — Wanted jobs feed: shortcuts, filter chips, a horizontal
   "high match" rail, theme chips, and a recommended list. */
function SectionHeader({ title, action }) {
  const { Icon } = window.WantedDesignSystem_3ed5bb;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 14 }}>
      <h2 className="wt-heading2" style={{ margin: 0, color: "var(--label-normal)" }}>{title}</h2>
      {action ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "var(--label-alternative)", fontSize: 13, fontWeight: 500 }}>
          {action}<Icon name="chevronRight" size={16} />
        </span>
      ) : null}
    </div>
  );
}

function HomeScreen({ bookmarks, toggleBookmark, openJob }) {
  const { Chip, Icon, ContentBadge } = window.WantedDesignSystem_3ed5bb;
  const jobs = window.WANTED_JOBS;
  const [filter, setFilter] = React.useState("all");
  const filters = [["all", "전체"], ["dev", "개발"], ["design", "디자인"], ["market", "마케팅"], ["pm", "기획"]];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 28 }}>
      {/* Shortcuts */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 24px 0" }}>
        {window.WANTED_SHORTCUTS.map((s) => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--primary-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={s.icon} size={24} color="var(--primary-normal)" />
            </div>
            <span className="wt-caption1" style={{ color: "var(--label-neutral)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 20px", scrollbarWidth: "none" }}>
        {filters.map(([k, v]) => (
          <Chip key={k} selected={filter === k} onClick={() => setFilter(k)}>{v}</Chip>
        ))}
        <Chip leadingIcon={<Icon name="filter" size={14} />}>필터</Chip>
      </div>

      {/* High-match rail */}
      <section>
        <SectionHeader title="합격 가능성 높은 포지션" action="전체" />
        <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "0 20px 4px", scrollbarWidth: "none" }}>
          {jobs.slice(0, 5).map((job) => (
            <window.JobCard key={job.id} job={job} variant="grid"
              bookmarked={bookmarks.has(job.id)} onBookmark={() => toggleBookmark(job.id)} onOpen={() => openJob(job.id)} />
          ))}
        </div>
      </section>

      {/* Theme chips */}
      <section>
        <SectionHeader title="테마로 살펴보는 포지션" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 20px" }}>
          {window.WANTED_THEMES.map((t) => (
            <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 14, background: "var(--background-normal)", boxShadow: "inset 0 0 0 1px var(--line-normal)", cursor: "pointer" }}>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: `var(--accent-foreground-${t.tone})` }} />
              <span className="wt-body2" style={{ fontWeight: 600, color: "var(--label-normal)" }}>{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended list */}
      <section>
        <SectionHeader title="추천 포지션" action="더보기" />
        <div style={{ padding: "0 20px" }}>
          {jobs.map((job) => (
            <window.JobCard key={job.id} job={job} variant="row"
              bookmarked={bookmarks.has(job.id)} onBookmark={() => toggleBookmark(job.id)} onOpen={() => openJob(job.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
window.HomeScreen = HomeScreen;
