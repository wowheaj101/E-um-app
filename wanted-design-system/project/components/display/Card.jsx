import React from "react";

/* Card — the base content surface. Wanted cards favor a hairline
   border over shadow; pass elevation="raised" for a floating card. */

export function Card({
  children,
  elevation = "flat",
  padding = 20,
  radius = 16,
  interactive = false,
  as = "div",
  style,
  ...rest
}) {
  const Tag = as;
  const shadow = {
    none: "none",
    flat: "none",
    raised: "var(--shadow-card)",
    floating: "var(--shadow-raised)",
  }[elevation];
  const border = elevation === "flat" || elevation === "none"
    ? "inset 0 0 0 1px var(--line-normal)"
    : "none";

  return (
    <Tag
      style={{
        boxSizing: "border-box",
        background: "var(--background-elevated)",
        borderRadius: radius,
        padding,
        boxShadow: [border, shadow].filter((s) => s && s !== "none").join(", ") || "none",
        transition: interactive ? "box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)" : undefined,
        cursor: interactive ? "pointer" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Card;
