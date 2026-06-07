import React, { useState } from "react";

/* Wanted Button.
   Tokens drive every color; sizes mirror the Figma Button spec
   (lg 48 / md 40 / sm 32 px tall). Hover & press states darken via
   token swaps held in component state, so the component is fully
   self-contained (no global CSS needed). */

const SIZES = {
  lg: { padV: 12, padH: 28, font: 16, weight: 700, line: 24, radius: 12, gap: 6, icon: 20, track: "0.006em" },
  md: { padV: 9, padH: 20, font: 15, weight: 700, line: 22, radius: 10, gap: 5, icon: 18, track: "0.010em" },
  sm: { padV: 7, padH: 14, font: 13, weight: 700, line: 18, radius: 8, gap: 4, icon: 16, track: "0.019em" },
};

function resolve(variant, tone, state) {
  // returns { bg, fg, border }
  const toneColor = {
    primary: { normal: "var(--primary-normal)", strong: "var(--primary-strong)", heavy: "var(--primary-heavy)", tint: "var(--primary-tint)", fg: "var(--primary-normal)" },
    neutral: { normal: "var(--label-normal)", strong: "#000", heavy: "#000", tint: "var(--fill-normal)", fg: "var(--label-normal)" },
    negative: { normal: "var(--status-negative)", strong: "var(--red-40)", heavy: "var(--red-30)", tint: "var(--status-negative-bg)", fg: "var(--status-negative)" },
  }[tone];

  if (variant === "solid") {
    const bg = state === "press" ? toneColor.heavy : state === "hover" ? toneColor.strong : toneColor.normal;
    return { bg, fg: "var(--static-white)", border: "transparent" };
  }
  if (variant === "weak") {
    const fill = state === "normal" ? toneColor.tint : "color-mix(in srgb, " + toneColor.normal + " " + (state === "press" ? "22%" : "14%") + ", transparent)";
    return { bg: fill, fg: toneColor.fg, border: "transparent" };
  }
  if (variant === "outline") {
    const bg = state === "normal" ? "transparent" : state === "press" ? "var(--fill-strong)" : "var(--fill-normal)";
    return { bg, fg: toneColor.fg, border: "var(--line-normal)" };
  }
  // text
  const bg = state === "normal" ? "transparent" : state === "press" ? "var(--fill-strong)" : "var(--fill-normal)";
  return { bg, fg: toneColor.fg, border: "transparent" };
}

export function Button({
  children,
  variant = "solid",
  tone = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  disabled = false,
  fullWidth = false,
  type = "button",
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const sz = SIZES[size] || SIZES.md;
  const state = press ? "press" : hover ? "hover" : "normal";
  const c = disabled
    ? { bg: variant === "solid" ? "var(--interaction-disable)" : "transparent", fg: "var(--label-disable)", border: variant === "outline" ? "var(--line-neutral)" : "transparent" }
    : resolve(variant, tone, state);

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        appearance: "none",
        boxSizing: "border-box",
        display: fullWidth ? "flex" : "inline-flex",
        width: fullWidth ? "100%" : "auto",
        alignItems: "center",
        justifyContent: "center",
        gap: sz.gap,
        padding: `${sz.padV}px ${sz.padH}px`,
        fontFamily: "var(--font-sans)",
        fontSize: sz.font,
        fontWeight: sz.weight,
        lineHeight: `${sz.line}px`,
        letterSpacing: sz.track,
        color: c.fg,
        background: c.bg,
        border: "none",
        boxShadow: c.border === "transparent" ? "none" : `inset 0 0 0 1px ${c.border}`,
        borderRadius: sz.radius,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
        userSelect: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {leadingIcon ? <span style={{ display: "inline-flex", width: sz.icon, height: sz.icon }}>{leadingIcon}</span> : null}
      {children != null ? <span>{children}</span> : null}
      {trailingIcon ? <span style={{ display: "inline-flex", width: sz.icon, height: sz.icon }}>{trailingIcon}</span> : null}
    </button>
  );
}

export default Button;
