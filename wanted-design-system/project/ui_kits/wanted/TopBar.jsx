/* TopBar — Wanted GNB. Wordmark left, search + bell right.
   The wordmark is the real Wanted vector (inline SVG, currentColor). */
function WantedWordmark({ height = 18, color = "var(--label-normal)" }) {
  return (
    <svg viewBox="0 0 3213 730" height={height} style={{ display: "block", color }}>
      <path fill="currentColor" d="M 2964 730 C 3027 730 3080 703 3109 661 L 3109 720 L 3213 720 L 3213 0 L 3109 0 L 3109 274 C 3080 235 3026 210 2963 210 C 2818 210 2707 327 2707 470 C 2707 613 2819 730 2964 730 Z M 2964 630 C 2879 630 2809 557 2809 470 C 2809 383 2879 310 2964 310 C 3049 310 3119 383 3119 470 C 3119 557 3049 630 2964 630 Z M 2269 428 C 2273 364 2336 303 2414 303 C 2492 303 2551 364 2555 428 L 2269 428 Z M 2423 730 C 2524 730 2612 672 2648 592 L 2565 564 C 2541 607 2485 637 2424 637 C 2336 637 2273 583 2269 510 L 2654 510 C 2674 342 2573 210 2423 210 C 2273 210 2167 317 2167 470 C 2167 623 2272 730 2423 730 Z M 2050 729 C 2081 729 2112 722 2132 711 L 2132 620 C 2108 632 2087 637 2073 637 C 2033 637 2013 613 2013 564 L 2013 302 L 2132 302 L 2132 220 L 2013 220 L 2013 120 L 1909 120 L 1909 220 L 1829 220 L 1829 302 L 1909 302 L 1909 568 C 1909 669 1961 729 2050 729 Z M 1337 720 L 1441 720 L 1441 436 C 1441 349 1490 300 1561 300 C 1632 300 1680 349 1680 436 L 1680 720 L 1784 720 L 1784 430 C 1784 289 1719 210 1593 210 C 1526 210 1466 237 1441 284 L 1441 220 L 1337 220 L 1337 720 Z M 998 630 C 913 630 843 557 843 470 C 843 383 913 310 998 310 C 1083 310 1153 383 1153 470 C 1153 557 1083 630 998 630 Z M 998 730 C 1061 730 1114 703 1143 661 L 1143 720 L 1247 720 L 1247 220 L 1143 220 L 1143 274 C 1114 235 1060 210 997 210 C 852 210 741 327 741 470 C 741 613 853 730 998 730 Z M 176 720 L 275 720 L 368 440 L 461 720 L 560 720 L 736 220 L 627 220 L 512 572 L 407 220 L 329 220 L 224 572 L 109 220 L 0 220 L 176 720 Z" />
    </svg>
  );
}
window.WantedWordmark = WantedWordmark;

function TopBar({ onSearch }) {
  const { IconButton, Icon, Badge } = window.WantedDesignSystem_3ed5bb;
  return (
    <div style={{
      height: 56, flexShrink: 0, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 8px 0 16px",
      background: "var(--background-normal)",
      boxShadow: "inset 0 -1px 0 var(--line-alternative)",
    }}>
      <WantedWordmark height={18} />
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton icon={<Icon name="search" />} aria-label="검색" onClick={onSearch} />
        <span style={{ position: "relative", display: "inline-flex" }}>
          <IconButton icon={<Icon name="bell" />} aria-label="알림" />
          <span style={{ position: "absolute", top: 6, right: 6, pointerEvents: "none" }}><Badge dot /></span>
        </span>
      </div>
    </div>
  );
}
window.TopBar = TopBar;
