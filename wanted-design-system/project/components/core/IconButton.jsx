import React, { useState } from "react";

/* Square icon-only button. Same interaction model as Button.
   Sizes give a comfortable touch target (lg 48 / md 40 / sm 32). */

const SIZES = {
  lg: { box: 48, radius: 12, icon: 24 },
  md: { box: 40, radius: 10, icon: 22 },
  sm: { box: 32, radius: 8, icon: 20 },
};

export function IconButton({
  icon,
  variant = "text",
  tone = "neutral",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const sz = SIZES[size] || SIZES.md;
  const state = press ? "press" : hover ? "hover" : "normal";

  const fg = {
    primary: "var(--primary-normal)",
    neutral: "var(--label-neutral)",
    negative: "var(--status-negative)",
  }[tone];

  let bg = "transparent";
  if (!disabled) {
    if (variant === "solid") bg = state === "press" ? "var(--primary-heavy)" : state === "hover" ? "var(--primary-strong)" : "var(--primary-normal)";
    else bg = state === "press" ? "var(--fill-strong)" : state === "hover" ? "var(--fill-normal)" : "transparent";
  }
  const color = disabled ? "var(--label-disable)" : variant === "solid" ? "var(--static-white)" : fg;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        appearance: "none",
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: sz.box,
        height: sz.box,
        padding: 0,
        color,
        background: bg,
        border: variant === "outline" ? "none" : "none",
        boxShadow: variant === "outline" ? "inset 0 0 0 1px var(--line-normal)" : "none",
        borderRadius: sz.radius,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ display: "inline-flex", width: sz.icon, height: sz.icon }}>{icon}</span>
    </button>
  );
}

export default IconButton;
