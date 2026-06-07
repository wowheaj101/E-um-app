import React, { useState } from "react";

/* Checkbox — square selection control. Controlled when `checked` is
   provided, otherwise self-manages. Checked state fills with primary
   and shows a white check. */

const Check = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
    <path d="M5 12.5l4.4 4.4L19 7.6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  size = "md",
  style,
  ...rest
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const box = size === "sm" ? 20 : 22;

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange && onChange(!on);
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
        role="checkbox"
        aria-checked={on}
        aria-disabled={disabled || undefined}
        onClick={toggle}
        style={{
          boxSizing: "border-box",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: box,
          height: box,
          borderRadius: 6,
          background: on ? "var(--primary-normal)" : "var(--background-normal)",
          boxShadow: on ? "none" : "inset 0 0 0 1.5px var(--line-strong)",
          color: "var(--static-white)",
          transition: "background var(--duration-fast) var(--ease-standard)",
          flexShrink: 0,
        }}
      >
        {on ? <Check s={box - 6} /> : null}
      </span>
      {label != null ? (
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 500, color: "var(--label-normal)", letterSpacing: "0.0096em" }}>{label}</span>
      ) : null}
    </label>
  );
}

export default Checkbox;
