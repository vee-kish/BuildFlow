import { NavLink } from "react-router-dom";
import { navItemsForRole } from "./Sidebar";
import { cx } from "../../utils/cx";
import "./MobileNav.css";

const MAX_ITEMS = 5;

export function MobileNav({ role }) {
  const items = navItemsForRole(role).slice(0, MAX_ITEMS);

  return (
    <nav className="mobile-nav" aria-label="Quick navigation">
      <ul className="mobile-nav__list">
        {items.map(({ key, path, label, Icon }) => (
          <li key={key} className="mobile-nav__item">
            <NavLink
              to={path}
              className={({ isActive }) =>
                cx("mobile-nav__link", isActive && "mobile-nav__link--active")
              }
            >
              <Icon size={20} aria-hidden="true" />
              <span className="mobile-nav__label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
