import * as React from "react";

/**
 * Small categorical label / tag ("정규직", "신입", "D-7").
 */
export interface ContentBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  /** Accent hue, or "neutral" for the grey system. Default "blue". */
  tone?: "blue" | "violet" | "green" | "red" | "orange" | "cyan" | "pink" | "neutral";
  /** "weak" tinted (default) or "solid" filled. */
  variant?: "weak" | "solid";
  /** sm (default) / md. */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

export function ContentBadge(props: ContentBadgeProps): JSX.Element;
export default ContentBadge;
