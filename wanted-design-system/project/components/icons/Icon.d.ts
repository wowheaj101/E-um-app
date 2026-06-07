import * as React from "react";

/**
 * Wanted icon. 24px grid, filled-vector glyphs that paint with
 * `currentColor`. Names mirror the Figma icon library.
 *
 * @startingPoint section="Foundations" subtitle="24px currentColor icon set" viewport="700x220"
 */
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Icon name. See ICON_NAMES for the full set. */
  name:
    | "home" | "search" | "bookmark" | "bell" | "person" | "message"
    | "heart" | "plus" | "share" | "setting" | "filter" | "location"
    | "pin" | "clock" | "coins" | "calendar" | "chevronDown" | "chevronLeft"
    | "chevronRight" | "check" | "close" | "circleCheck" | "circleInfo"
    | "circleExclamation" | "triangleExclamation" | "trash" | "globe" | "squareMore";
  /** Square px size. Default 24. */
  size?: number;
  /** Overrides currentColor for the glyph. */
  color?: string;
  /** Accessible label; when omitted the icon is decorative (aria-hidden). */
  title?: string;
}

export function Icon(props: IconProps): JSX.Element | null;
export const ICON_NAMES: string[];
export default Icon;
