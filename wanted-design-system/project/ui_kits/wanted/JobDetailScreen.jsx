/* JobDetailScreen — posting detail with a sticky apply bar. */
function JobDetailScreen({ job, bookmarked, toggleBookmark, onBack, onApply }) {
  const { Icon, IconButton, ContentBadge, Button, Avatar, Card } = window.WantedDesignSystem_3ed5bb;
  if (!job) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Detail top bar */}
      <div style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", background: "var(--background-normal)", boxShadow: "inset 0 -1px 0 var(--line-alternative)" }}>
        <IconButton icon={<Icon name="chevronLeft" />} aria-label="뒤로" onClick={onBack} />
        <div style={{ display: "flex", gap: 2 }}>
          <IconButton icon={<Icon name="share" />} aria-label="공유" />
          <IconButton icon={<Icon name="squareMore" />} aria-label="더보기" />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Company header */}
        <div style={{ padding: "24px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={job.company} size={56} style={{ background: job.logo, color: "#fff", fontSize: 24 }} />
            <div>
              <div className="wt-headline2" style={{ fontWeight: 600, color: "var(--label-normal)" }}>{job.company}</div>
              <div className="wt-label1" style={{ color: "var(--label-alternative)", marginTop: 2 }}>IT·소프트웨어 · 200~500명</div>
            </div>
          </div>
          <h1 className="wt-title2" style={{ margin: 0, color: "var(--label-normal)", letterSpacing: "-0.0236em" }}>{job.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <ContentBadge tone="blue">{job.type}</ContentBadge>
            <ContentBadge tone="neutral">{job.location}</ContentBadge>
            <ContentBadge tone="neutral">{job.exp}</ContentBadge>
            <ContentBadge tone="red" variant="solid">{job.deadline}</ContentBadge>
          </div>
        </div>

        {/* Reward callout */}
        <div style={{ padding: "0 20px 20px" }}>
          <Card padding={16} style={{ background: "var(--primary-tint)", boxShadow: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="coins" size={22} color="var(--primary-normal)" />
            <div style={{ flex: 1 }}>
              <div className="wt-label1" style={{ fontWeight: 700, color: "var(--primary-strong)" }}>{job.reward}</div>
              <div className="wt-caption1" style={{ color: "var(--primary-normal)", opacity: 0.8 }}>이 포지션에 합격하면 받을 수 있어요</div>
            </div>
          </Card>
        </div>

        {/* Tags */}
        <div style={{ padding: "0 20px 24px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {job.tags.map((t) => (
            <span key={t} style={{ padding: "6px 12px", borderRadius: 9999, background: "var(--fill-normal)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--label-neutral)" }}>#{t}</span>
          ))}
        </div>

        <div style={{ height: 8, background: "var(--background-normal-alternative)" }} />

        {/* Body sections */}
        <div style={{ padding: "24px 20px 20px", display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { h: "주요 업무", items: ["사용자 중심의 웹 서비스 프론트엔드 개발", "디자인 시스템 구축 및 운영", "성능 최적화와 접근성 개선"] },
            { h: "자격 요건", items: ["관련 경력 3년 이상 보유하신 분", "React 및 TypeScript 실무 경험", "협업과 커뮤니케이션에 능숙하신 분"] },
            { h: "우대 사항", items: ["대규모 트래픽 서비스 경험", "오픈소스 기여 경험"] },
          ].map((sec) => (
            <div key={sec.h}>
              <h3 className="wt-headline1" style={{ margin: "0 0 12px", fontWeight: 600, color: "var(--label-normal)" }}>{sec.h}</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                {sec.items.map((it, i) => (
                  <li key={i} style={{ display: "flex", gap: 9 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 9999, background: "var(--label-assistive)", marginTop: 9, flexShrink: 0 }} />
                    <span className="wt-body1-reading" style={{ color: "var(--label-neutral)" }}>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="wt-caption1" style={{ color: "var(--label-assistive)" }}>최근 일주일 {job.applicants}명이 지원했어요</div>
        </div>
      </div>

      {/* Sticky apply bar */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 14px", background: "var(--background-normal)", boxShadow: "inset 0 1px 0 var(--line-normal)" }}>
        <IconButton variant="outline" size="lg" icon={<Icon name="bookmark" />} aria-label="저장"
          onClick={toggleBookmark} style={bookmarked ? { color: "var(--primary-normal)", boxShadow: "inset 0 0 0 1px var(--primary-normal)" } : undefined} />
        <Button size="lg" fullWidth onClick={onApply} style={{ flex: 1 }}>지원하기</Button>
      </div>
    </div>
  );
}
window.JobDetailScreen = JobDetailScreen;
