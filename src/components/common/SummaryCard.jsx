import { cx } from "../../utils/cx";
import "./SummaryCard.css";

export function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  footnote,
  onClick,
  className,
}) {
  const content = (
    <>
      <div className="summary-card__icon" aria-hidden="true">
        {Icon && <Icon size={20} />}
      </div>
      <div className="summary-card__content">
        <p className="summary-card__value">{value}</p>
        <p className="summary-card__label">{label}</p>
        {footnote && <p className="summary-card__footnote">{footnote}</p>}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cx(
          "summary-card",
          "summary-card--clickable",
          `summary-card--${tone}`,
          className
        )}
        aria-label={`${label}: ${value}. View details`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cx("summary-card", `summary-card--${tone}`, className)}>
      {content}
    </div>
  );
}
