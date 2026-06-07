import * as React from "react";

/**
 * Single-line text input with label, helper, and error states.
 *
 * @startingPoint section="Forms" subtitle="Text input with label + states" viewport="700x220"
 */
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "style"> {
  label?: string;
  helper?: string;
  /** Error message; sets the invalid (red) state when present. */
  error?: string;
  /** lg 52 / md 48 / sm 40 px. Default "md". */
  size?: "lg" | "md" | "sm";
  /** Adornment before the input (e.g. <Icon/>). */
  leading?: React.ReactNode;
  /** Adornment after the input. */
  trailing?: React.ReactNode;
  style?: React.CSSProperties;
}

export function TextField(props: TextFieldProps): JSX.Element;
export default TextField;
