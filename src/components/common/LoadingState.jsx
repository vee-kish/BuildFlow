import { Loader2 } from "lucide-react";
import { cx } from "../../utils/cx";
import "./LoadingState.css";

export function LoadingState({ label = "Loading…", variant = "spinner", rows = 3, className }) {
  if (variant === "skeleton") {
    return (
      <div className={cx("loading-state", className)} role="status" aria-label={label}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="skeleton loading-state__skeleton-row" />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div className={cx("loading-state", className)} role="status" aria-label={label}>
      <Loader2 className="loading-state__spinner" size={24} aria-hidden="true" />
      <span className="loading-state__label">{label}</span>
    </div>
  );
}
