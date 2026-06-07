import * as React from "react";

export interface SegmentItem { value: string; label: React.ReactNode; }

/** Compact 2–4 option toggle with a sliding knob. */
export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "style"> {
  items: SegmentItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: "md" | "sm";
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
export default SegmentedControl;
