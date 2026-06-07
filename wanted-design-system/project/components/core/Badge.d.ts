import * as React from "react";

/**
 * Notification dot or numeric count, pinned to icons/avatars.
 */
export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  /** Number to display (ignored when `dot`). */
  count?: number | string;
  /** Cap before showing "N+". Default 99. */
  max?: number;
  /** Render a bare dot instead of a count. */
  dot?: boolean;
  tone?: "negative" | "primary" | "neutral";
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
export default Badge;
