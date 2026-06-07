import * as React from "react";

export interface TabItem { value: string; label: React.ReactNode; count?: number | string; }

/** Underline tab bar for top-level sections. */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "style"> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Distribute tabs evenly across the width. */
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export function Tabs(props: TabsProps): JSX.Element;
export default Tabs;
