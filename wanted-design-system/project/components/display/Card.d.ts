import * as React from "react";

/** Base content surface (white, rounded). Hairline border by default. */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  /** flat (hairline border) · raised · floating · none. Default "flat". */
  elevation?: "flat" | "raised" | "floating" | "none";
  /** Inner padding (px). Default 20. */
  padding?: number | string;
  /** Corner radius (px). Default 16. */
  radius?: number;
  /** Adds pointer cursor + transition for clickable cards. */
  interactive?: boolean;
  /** Element tag. Default "div". */
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
export default Card;
