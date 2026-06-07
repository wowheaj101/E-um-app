import React, { useState } from "react";

/* Tabs — underline navigation across primary sections. Active tab gets
   strong label color + a primary indicator; supports a trailing count. */

export function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  fullWidth = false,
  style,
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? (items[0] && items[0].value));
  const current = isControlled ? value : internal;

  const select = (v) => {
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  };

  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: fullWidth ? 0 : 20,
        boxShadow: "inset 0 -1px 0 var(--line-normal)",
        ...style,
      }}
      {...rest}
    >
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
              appearance: "none",
              border: "none",
              background: "transparent",
              flex: fullWidth ? 1 : "0 0 auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 2px",
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              fontWeight: active ? 700 : 500,
              letterSpacing: "-0.012em",
              color: active ? "var(--label-normal)" : "var(--label-alternative)",
              cursor: "pointer",
              boxShadow: active ? "inset 0 -2px 0 var(--label-normal)" : "none",
              transition: "color var(--duration-fast) var(--ease-standard)",
              whiteSpace: "nowrap",
            }}
          >
            {it.label}
            {it.count != null ? (
              <span style={{ fontSize: 14, fontWeight: 600, color: active ? "var(--primary-normal)" : "var(--label-assistive)" }}>
                {it.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
