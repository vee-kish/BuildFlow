import { cx } from "../../utils/cx";
import "./Card.css";

export function Card({ title, subtitle, action, className, bodyClassName, children }) {
  return (
    <section className={cx("card", className)}>
      {(title || action) && (
        <header className="card__header">
          <div>
            {title && <h2 className="card__title">{title}</h2>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card__action">{action}</div>}
        </header>
      )}
      <div className={cx("card__body", bodyClassName)}>{children}</div>
    </section>
  );
}
