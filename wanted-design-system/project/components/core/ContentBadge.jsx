import React from "react";

/* ContentBadge — a small categorical label ("신입", "정규직", "D-7").
   `tone` picks an accent hue; `variant` chooses tinted vs solid fill.
   Neutral tone uses the grey fill system. */

const SIZES = {
  md: { padV: 3, padH: 8, font: 13, line: 18, radius: 6 },
  sm: { padV: 2, padH: 6, font: 12, line: 16, radius: 5 },
};

const TONES = ["blue", "violet", "green", "red", "orange", "cyan", "pink", "neutral"];

export function ContentBadge({
  children,
  tone = "blue",
  variant = "weak",
  size = "sm",
  style,
  ...rest
}) {
  const sz = SIZES[size] || SIZES.sm;
  let bg, fg;

  if (tone === "neutral") {
    bg = variant === "solid" ? "var(--label-normal)" : "var(--fill-normal)";
    fg = variant === "solid" ? "var(--static-white)" : "var(--label-alternative)";
  } else {
    const hue = TONES.includes(tone) ? tone : "blue";
    if (variant === "solid") {
      bg = `var(--accent-foreground-${hue})`;
      fg = "var(--static-white)";
    } else {
      bg = `var(--accent-background-${hue})`;
      fg = `var(--accent-foreground-${hue})`;
    }
  }

  return (
    <span
      style={{
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        padding: `${sz.padV}px ${sz.padH}px`,
        fontFamily: "var(--font-sans)",
        fontSize: sz.font,
        fontWeight: 600,
        lineHeight: `${sz.line}px`,
        letterSpacing: "0.01em",
        color: fg,
        background: bg,
        borderRadius: sz.radius,
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

export default ContentBadge;
