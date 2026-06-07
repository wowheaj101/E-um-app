import * as React from "react";

/** Tappable list row: leading · title/description · trailing. */
export interface ListCellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "style"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Leading slot — icon, avatar, or control. */
  leading?: React.ReactNode;
  /** Trailing slot — value text, chevron, switch, etc. */
  trailing?: React.ReactNode;
  /** Hairline divider below the row. */
  divider?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function ListCell(props: ListCellProps): JSX.Element;
export default ListCell;
