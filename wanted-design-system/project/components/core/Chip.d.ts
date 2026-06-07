import * as React from "react";

/**
 * Selectable filter / choice chip.
 */
export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** lg / md / sm / xs. Default "sm". */
  size?: "lg" | "md" | "sm" | "xs";
  /** Selected (filled-tint) state. */
  selected?: boolean;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Chip(props: ChipProps): JSX.Element;
export default Chip;
