import * as React from "react";

/** Circular single-select control. Manage the chosen value in parent state. */
export interface RadioProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, "onChange" | "style"> {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Receives this radio's `value` (or true) when selected. */
  onChange?: (value: any) => void;
  value?: any;
  name?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: "md" | "sm";
  style?: React.CSSProperties;
}

export function Radio(props: RadioProps): JSX.Element;
export default Radio;
