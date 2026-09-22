import { Loader2 } from "lucide-react";
import { cx } from "../../utils/cx";
import "./Button.css";

const VARIANTS = ["primary", "secondary", "dark", "ghost", "danger"];
const SIZES = ["sm", "md", "lg"];

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  className,
  children,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && "btn--full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <Loader2 className="btn__spinner" size={16} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
