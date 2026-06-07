import React, { useState } from "react";

/* Radio — single-select control. Use within a RadioGroup-style row by
   sharing a `name` and managing the selected value in parent state. */

export function Radio({
  checked,
  defaultChecked = false,
  onChange,
  label,
  name,
  value,
  disabled = false,
  size = "md",
  style,
  ...rest
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const box = size === "sm" ? 20 : 22;

  const select = () => {
    if (disabled) return;
    if (!isControlled) setInternal(true);
    onChange && onChange(value !== undefined ? value : true);
  };

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        userSelect: "none",
        ...style,
      }}
      {...rest}
    >
      <span
        role="radio"
        aria-checked={on}
        aria-disabled={disabled || undefined}
        onClick={select}
        style={{
          boxSizing: "border-box",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: box,
          height: box,
          borderRadius: "var(--radius-full)",
          background: "var(--background-normal)",
          boxShadow: on ? `inset 0 0 0 ${Math.round(box * 0.3)}px var(--primary-normal)` : "inset 0 0 0 1.5px var(--line-strong)",
          transition: "box-shadow var(--duration-fast) var(--ease-standard)",
          flexShrink: 0,
        }}
      >
        <span style={{ width: box * 0.32, height: box * 0.32, borderRadius: "var(--radius-full)", background: on ? "var(--static-white)" : "transparent" }} />
      </span>
      {label != null ? (
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 500, color: "var(--label-normal)", letterSpacing: "0.0096em" }}>{label}</span>
      ) : null}
    </label>
  );
}

export default Radio;
