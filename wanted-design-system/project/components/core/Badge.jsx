import React from "react";

/* Badge — notification dot or count, usually pinned to an icon/avatar.
   `dot` renders a bare indicator; otherwise it shows the (capped) count. */

export function Badge({
  count,
  max = 99,
  dot = false,
  tone = "negative",
  style,
  ...rest
}) {
  const bg = {
    negative: "var(--status-negative)",
    primary: "var(--primary-normal)",
    neutral: "var(--label-normal)",
  }[tone] || "var(--status-negative)";

  if (dot) {
    return (
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "var(--radius-full)",
          background: bg,
          boxShadow: "0 0 0 2px var(--background-normal)",
          ...style,
        }}
        {...rest}
      />
    );
  }

  const label = typeof count === "number" && count > max ? `${max}+` : count;
  return (
    <span
      style={{
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        color: "var(--static-white)",
        background: bg,
        borderRadius: "var(--radius-full)",
        boxShadow: "0 0 0 2px var(--background-normal)",
        ...style,
      }}
      {...rest}
    >
      {label}
    </span>
  );
}

export default Badge;
