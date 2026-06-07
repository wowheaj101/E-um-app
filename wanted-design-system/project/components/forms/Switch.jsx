import React, { useState } from "react";

/* Switch — instant on/off toggle. Track fills primary when on; the
   knob slides with an emphasized ease. */

const SIZES = {
  md: { w: 52, h: 32, knob: 26, pad: 3 },
  sm: { w: 44, h: 26, knob: 21, pad: 2.5 },
};

export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = "md",
  "aria-label": ariaLabel,
  style,
  ...rest
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const sz = SIZES[size] || SIZES.md;

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange && onChange(!on);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={toggle}
      style={{
        appearance: "none",
        border: "none",
        boxSizing: "border-box",
        position: "relative",
        width: sz.w,
        height: sz.h,
        padding: 0,
        borderRadius: "var(--radius-full)",
        background: on ? "var(--primary-normal)" : "var(--cool-neutral-90)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--duration-base) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          position: "absolute",
          top: sz.pad,
          left: on ? sz.w - sz.knob - sz.pad : sz.pad,
          width: sz.knob,
          height: sz.knob,
          borderRadius: "var(--radius-full)",
          background: "var(--static-white)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          transition: "left var(--duration-base) var(--ease-emphasized)",
        }}
      />
    </button>
  );
}

export default Switch;
