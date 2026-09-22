import { cx } from "../../utils/cx";
import "./PageHeader.css";

export function PageHeader({ title, subtitle, actions, className, children }) {
  return (
    <header className={cx("page-header", className)}>
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
