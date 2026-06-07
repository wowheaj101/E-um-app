import React, { useState } from "react";

/* SegmentedControl — a compact 2–4 option switch with a sliding white
   knob over a grey fill track. Controlled or uncontrolled. */

export function SegmentedControl({
  items = [],
  value,
  defaultValue,
  onChange,
  size = "md",
  fullWidth = false,
  style,
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? (items[0] && items[0].value));
  const current = isControlled ? value : internal;
  const idx = Math.max(0, items.findIndex((it) => it.value === current));
  const h = size === "sm" ? 32 : 40;
  const font = size === "sm" ? 13 : 14;

  const select = (v) => {
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  };

  return (
    <div
      role="tablist"
      style={{
        position: "relative",
        display: fullWidth ? "grid" : "inline-grid",
        gridTemplateColumns: `repeat(${items.length}, ${fullWidth ? "1fr" : "minmax(64px, auto)"})`,
        width: fullWidth ? "100%" : "auto",
        height: h,
        padding: 3,
        background: "var(--fill-normal)",
        borderRadius: size === "sm" ? 10 : 12,
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3,
          left: 3,
          height: h - 6,
          width: `calc((100% - 6px) / ${items.length})`,
          transform: `translateX(${idx * 100}%)`,
          background: "var(--background-normal)",
          borderRadius: size === "sm" ? 8 : 9,
          boxShadow: "0 1px 3px rgba(23,23,25,0.10)",
          transition: "transform var(--duration-base) var(--ease-emphasized)",
        }}
      />
      {items.map((it) => {
        const active = it.value === current;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => select(it.value)}
            style={{
              position: "relative",
              zIndex: 1,
              appearance: "none",
              border: "none",
              background: "transparent",
              fontFamily: "var(--font-sans)",
              fontSize: font,
              fontWeight: active ? 600 : 500,
              color: active ? "var(--label-normal)" : "var(--label-alternative)",
              cursor: "pointer",
              padding: "0 14px",
              transition: "color var(--duration-base) var(--ease-standard)",
              whiteSpace: "nowrap",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
