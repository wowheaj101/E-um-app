import * as React from "react";

/**
 * Square, icon-only button (nav bars, toolbars, card actions).
 */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** The glyph, usually an <Icon/>. */
  icon: React.ReactNode;
  /** Default "text" (bare). */
  variant?: "solid" | "outline" | "text";
  tone?: "primary" | "neutral" | "negative";
  /** lg 48 / md 40 / sm 32 px square. Default "md". */
  size?: "lg" | "md" | "sm";
  disabled?: boolean;
  /** Required for accessibility — describes the action. */
  "aria-label": string;
  style?: React.CSSProperties;
}

export function IconButton(props: IconButtonProps): JSX.Element;
export default IconButton;
