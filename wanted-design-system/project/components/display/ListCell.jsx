import React, { useState } from "react";

/* ListCell — a tappable list row: [leading] title / description [trailing].
   The Wanted workhorse for settings, menus, and resource lists. */

export function ListCell({
  title,
  description,
  leading,
  trailing,
  onClick,
  divider = false,
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const tappable = Boolean(onClick) && !disabled;

  return (
    <div
      role={tappable ? "button" : undefined}
      tabIndex={tappable ? 0 : undefined}
      onClick={tappable ? onClick : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "14px 4px",
        background: tappable && hover ? "var(--fill-alternative)" : "transparent",
        borderRadius: 12,
        boxShadow: divider ? "inset 0 -1px 0 var(--line-alternative)" : "none",
        cursor: tappable ? "pointer" : "default",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      {leading ? <span style={{ display: "inline-flex", flexShrink: 0 }}>{leading}</span> : null}
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 500, color: "var(--label-normal)", letterSpacing: "0.0057em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </span>
        {description != null ? (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--label-alternative)", letterSpacing: "0.0194em" }}>
            {description}
          </span>
        ) : null}
      </span>
      {trailing ? <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, color: "var(--label-alternative)" }}>{trailing}</span> : null}
    </div>
  );
}

export default ListCell;
