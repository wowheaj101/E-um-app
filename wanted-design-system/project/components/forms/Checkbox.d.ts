import * as React from "react";

/** Square checkbox. Controlled via `checked`, or uncontrolled via `defaultChecked`. */
export interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, "onChange" | "style"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  /** Optional inline label text. */
  label?: React.ReactNode;
  disabled?: boolean;
  /** md 22 / sm 20 px. Default "md". */
  size?: "md" | "sm";
  style?: React.CSSProperties;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
export default Checkbox;
