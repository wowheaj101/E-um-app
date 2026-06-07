import React, { useState } from "react";

/* Wanted Chip — a selectable filter / choice token.
   Default state is a hairline outline; selected fills with a faint
   primary tint and a primary hairline + primary text. */

const SIZES = {
  lg: { padV: 9, padH: 12, font: 15, line: 22, radius: 10, gap: 3, icon: 16 },
  md: { padV: 7, padH: 11, font: 15, line: 22, radius: 10, gap: 3, icon: 16 },
  sm: { padV: 6, padH: 8, font: 14, line: 20, radius: 8, gap: 2, icon: 14 },
  xs: { padV: 4, padH: 7, font: 12, line: 16, radius: 6, gap: 2, icon: 12 },
};

export function Chip({
  children,
  size = "sm",
  selected = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const sz = SIZES[size] || SIZES.sm;

  let bg = "transparent";
  let border = "var(--line-neutral)";
  let fg = "var(--label-alternative)";
  let weight = 500;

  if (disabled) {
    fg = "var(--label-disable)";
    border = "var(--line-neutral)";
  } else if (selected) {
    bg = "var(--primary-tint)";
    border = "color-mix(in srgb, var(--primary-normal) 43%, transparent)";
    fg = "var(--primary-normal)";
    weight = 600;
    if (hover) bg = "color-mix(in srgb, var(--primary-normal) 10%, transparent)";
  } else if (hover) {
    bg = "var(--fill-normal)";
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: "none",
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        gap: sz.gap,
        padding: `${sz.padV}px ${sz.padH}px`,
        fontFamily: "var(--font-sans)",
        fontSize: sz.font,
        fontWeight: weight,
        lineHeight: `${sz.line}px`,
        color: fg,
        background: bg,
        border: "none",
        boxShadow: `inset 0 0 0 1px ${border}`,
        borderRadius: sz.radius,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {leadingIcon ? <span style={{ display: "inline-flex", width: sz.icon, height: sz.icon, padding: "1px 0" }}>{leadingIcon}</span> : null}
      <span style={{ padding: "0 2px" }}>{children}</span>
      {trailingIcon ? <span style={{ display: "inline-flex", width: sz.icon, height: sz.icon, padding: "1px 0" }}>{trailingIcon}</span> : null}
    </button>
  );
}

export default Chip;
