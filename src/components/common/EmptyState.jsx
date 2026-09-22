import { cx } from "../../utils/cx";
import "./EmptyState.css";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cx("empty-state", className)}>
      {Icon && (
        <div className="empty-state__icon" aria-hidden="true">
          <Icon size={28} />
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
