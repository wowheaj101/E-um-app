import React, { useState } from "react";

/* Wanted TextField. Hairline border by default; focus swaps to a
   primary border + 3px primary ring. Supports leading/trailing
   adornments, helper text, and an error state. */

const SIZES = {
  lg: { h: 52, font: 16, padH: 16, radius: 12 },
  md: { h: 48, font: 15, padH: 14, radius: 12 },
  sm: { h: 40, font: 14, padH: 12, radius: 10 },
};

export function TextField({
  label,
  value,
  defaultValue,
  placeholder,
  helper,
  error,
  size = "md",
  leading,
  trailing,
  disabled = false,
  type = "text",
  onChange,
  style,
  id,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const sz = SIZES[size] || SIZES.md;
  const invalid = Boolean(error);
  const fieldId = id || (label ? `tf-${Math.random().toString(36).slice(2, 8)}` : undefined);

  let borderColor = "var(--line-normal)";
  if (invalid) borderColor = "var(--status-negative)";
  else if (focus) borderColor = "var(--primary-normal)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label ? (
        <label htmlFor={fieldId} style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--label-neutral)", letterSpacing: "0.0145em" }}>
          {label}
        </label>
      ) : null}
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: sz.h,
          padding: `0 ${sz.padH}px`,
          background: disabled ? "var(--fill-alternative)" : "var(--background-normal)",
          borderRadius: sz.radius,
          boxShadow: `inset 0 0 0 ${focus && !invalid ? 1.5 : 1}px ${borderColor}${focus ? "" : ""}` ,
          outline: focus ? `3px solid ${invalid ? "color-mix(in srgb, var(--status-negative) 18%, transparent)" : "var(--primary-tint)"}` : "3px solid transparent",
          transition: "box-shadow var(--duration-fast) var(--ease-standard), outline-color var(--duration-fast) var(--ease-standard)",
          cursor: disabled ? "not-allowed" : "text",
        }}
      >
        {leading ? <span style={{ display: "inline-flex", color: "var(--label-alternative)", flexShrink: 0 }}>{leading}</span> : null}
        <input
          id={fieldId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          aria-invalid={invalid || undefined}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: sz.font,
            fontWeight: 500,
            color: "var(--label-normal)",
            letterSpacing: "0.0096em",
          }}
          {...rest}
        />
        {trailing ? <span style={{ display: "inline-flex", color: "var(--label-alternative)", flexShrink: 0 }}>{trailing}</span> : null}
      </div>
      {error || helper ? (
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, letterSpacing: "0.0194em", color: invalid ? "var(--status-negative)" : "var(--label-alternative)" }}>
          {error || helper}
        </span>
      ) : null}
    </div>
  );
}

export default TextField;
