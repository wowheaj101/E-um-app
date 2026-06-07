import React from "react";
import { Icon } from "../icons/Icon.jsx";

/* Toast — transient inverse-surface message. Optional status icon and
   a single trailing text action. Render inside your own positioning /
   timeout logic; this is the presentational shell. */

const STATUS = {
  neutral: null,
  positive: { name: "circleCheck", color: "var(--status-positive)" },
  negative: { name: "circleExclamation", color: "var(--status-negative)" },
  info: { name: "circleInfo", color: "var(--inverse-primary)" },
};

export function Toast({
  children,
  status = "neutral",
  icon,
  action,
  onAction,
  style,
  ...rest
}) {
  const st = STATUS[status];
  return (
    <div
      role="status"
      style={{
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        maxWidth: 520,
        padding: "13px 16px",
        background: "var(--inverse-background)",
        color: "var(--inverse-label)",
        borderRadius: 12,
        boxShadow: "var(--shadow-popover)",
        fontFamily: "var(--font-sans)",
        fontSize: 15,
        fontWeight: 500,
        lineHeight: "22px",
        letterSpacing: "0.0096em",
        ...style,
      }}
      {...rest}
    >
      {icon ? (
        <span style={{ display: "inline-flex", flexShrink: 0 }}>{icon}</span>
      ) : st ? (
        <Icon name={st.name} size={22} color={st.color} />
      ) : null}
      <span style={{ flex: 1 }}>{children}</span>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          style={{
            appearance: "none",
            border: "none",
            background: "transparent",
            color: "var(--inverse-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            padding: "0 2px",
          }}
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

export default Toast;
