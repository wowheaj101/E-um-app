import * as React from "react";

/**
 * Company (rounded square) or person (circle) avatar with image + initial fallback.
 */
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  /** Image URL. Omit to render the initial fallback. */
  src?: string;
  alt?: string;
  /** Name used for the initial fallback. */
  name?: string;
  /** "rounded" (company) or "circle" (person). Default "rounded". */
  shape?: "rounded" | "circle";
  /** Keyword (xl 64 / lg 48 / md 40 / sm 32 / xs 24) or explicit px. Default "md". */
  size?: "xl" | "lg" | "md" | "sm" | "xs" | number;
  style?: React.CSSProperties;
}

export function Avatar(props: AvatarProps): JSX.Element;
export default Avatar;
