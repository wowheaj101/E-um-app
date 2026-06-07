import * as React from "react";

/**
 * Wanted Button — the primary call-to-action control.
 *
 * @startingPoint section="Core" subtitle="CTA button, 4 variants × 3 tones" viewport="700x240"
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** Fill style. `solid` = filled, `weak` = tinted, `outline` = hairline border, `text` = bare. Default "solid". */
  variant?: "solid" | "weak" | "outline" | "text";
  /** Color intent. Default "primary". */
  tone?: "primary" | "neutral" | "negative";
  /** Height tier: lg 48 / md 40 / sm 32 px. Default "md". */
  size?: "lg" | "md" | "sm";
  /** Element (usually an <Icon/>) shown before the label. */
  leadingIcon?: React.ReactNode;
  /** Element shown after the label. */
  trailingIcon?: React.ReactNode;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
export default Button;
