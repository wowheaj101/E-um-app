import * as React from "react";

/** On/off toggle for instant settings (no submit). */
export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "style"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  size?: "md" | "sm";
  style?: React.CSSProperties;
}

export function Switch(props: SwitchProps): JSX.Element;
export default Switch;
