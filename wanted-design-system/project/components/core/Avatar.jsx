import React from "react";

/* Avatar — company logo (rounded square) or person (circle).
   Falls back to an initial on a tinted fill when no image is given. */

const SIZES = { xl: 64, lg: 48, md: 40, sm: 32, xs: 24 };

export function Avatar({
  src,
  alt = "",
  name = "",
  shape = "rounded",
  size = "md",
  style,
  ...rest
}) {
  const px = typeof size === "number" ? size : SIZES[size] || SIZES.md;
  const radius = shape === "circle" ? "var(--radius-full)" : Math.round(px * 0.28);
  const initial = (name || alt || "").trim().charAt(0).toUpperCase();

  return (
    <span
      style={{
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        borderRadius: radius,
        overflow: "hidden",
        background: "var(--fill-normal)",
        color: "var(--label-alternative)",
        fontFamily: "var(--font-sans)",
        fontSize: Math.round(px * 0.42),
        fontWeight: 600,
        flexShrink: 0,
        boxShadow: "inset 0 0 0 1px var(--line-alternative)",
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        initial || null
      )}
    </span>
  );
}

export default Avatar;
