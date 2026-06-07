/* JobCard — Wanted's signature posting card.
   `variant="grid"` = 152px horizontal-scroll card; `variant="row"` =
   full-width list card. Composes Avatar + ContentBadge from the DS. */
function JobCard({ job, variant = "grid", bookmarked, onBookmark, onOpen }) {
  const { Avatar, ContentBadge, Icon } = window.WantedDesignSystem_3ed5bb;

  if (variant === "row") {
    return (
      <div onClick={onOpen} style={{
        display: "flex", gap: 14, padding: "16px 0", cursor: "pointer",
        boxShadow: "inset 0 -1px 0 var(--line-alternative)",
      }}>
        <Avatar name={job.company} size={48} style={{ background: job.logo, color: "#fff" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
            <ContentBadge tone="violet">{job.reward}</ContentBadge>
          </div>
          <div className="wt-body1" style={{ fontWeight: 600, color: "var(--label-normal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
          <div className="wt-label1" style={{ color: "var(--label-neutral)", marginTop: 2 }}>{job.company}</div>
          <div className="wt-label2" style={{ color: "var(--label-alternative)", marginTop: 3 }}>{job.location} · {job.exp}</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onBookmark && onBookmark(); }}
          style={{ appearance: "none", border: "none", background: "transparent", cursor: "pointer", padding: 2, height: "fit-content", color: bookmarked ? "var(--primary-normal)" : "var(--label-assistive)" }}>
          <Icon name="bookmark" size={22} />
        </button>
      </div>
    );
  }

  // grid
  return (
    <div onClick={onOpen} style={{
      width: 152, flexShrink: 0, cursor: "pointer",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ position: "relative" }}>
        <div style={{ width: "100%", height: 152, borderRadius: 16, background: job.logo, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "inset 0 0 0 1px var(--line-alternative)" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 44, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{job.company.charAt(0)}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onBookmark && onBookmark(); }}
          style={{ position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: "var(--radius-full)", border: "none", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: bookmarked ? "var(--primary-normal)" : "var(--label-alternative)" }}>
          <Icon name="bookmark" size={18} />
        </button>
      </div>
      <div>
        <div className="wt-label1" style={{ fontWeight: 600, color: "var(--label-normal)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "20px", minHeight: 40 }}>{job.title}</div>
        <div className="wt-label2" style={{ color: "var(--label-neutral)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.company}</div>
        <div className="wt-caption1" style={{ color: "var(--label-alternative)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.location}</div>
        <div style={{ marginTop: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--violet-50)" }}>{job.reward}</div>
      </div>
    </div>
  );
}
window.JobCard = JobCard;
