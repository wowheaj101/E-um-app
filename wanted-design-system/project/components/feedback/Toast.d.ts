import * as React from "react";

/** Transient inverse-surface message with optional status icon + action. */
export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** Auto status icon. "neutral" shows none. */
  status?: "neutral" | "positive" | "negative" | "info";
  /** Override the status icon with your own node. */
  icon?: React.ReactNode;
  /** Trailing action label (renders a text button). */
  action?: React.ReactNode;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export function Toast(props: ToastProps): JSX.Element;
export default Toast;
