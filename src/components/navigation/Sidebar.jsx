import {
  Activity,
  AlertTriangle,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  HardHat,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../data/permissions";
import { FIRM } from "../../data/mockData";
import { cx } from "../../utils/cx";
import "./Sidebar.css";

const ICONS = {
  LayoutDashboard,
  Building2,
  FileText,
  AlertTriangle,
  Users,
  Activity,
  Settings,
};

export function navItemsForRole(role) {
  return Object.entries(NAV_ITEMS)
    .filter(([, item]) => item.roles.includes(role))
    .map(([key, item]) => ({ key, ...item, Icon: ICONS[item.icon] }));
}

export function Sidebar({
  role,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) {
  const items = navItemsForRole(role);

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={cx(
          "sidebar",
          collapsed && "sidebar--collapsed",
          mobileOpen && "sidebar--mobile-open"
        )}
        aria-label="Main navigation"
      >
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">
            <HardHat size={22} />
          </span>
          {!collapsed && (
            <span className="sidebar__brand-text">
              <span className="sidebar__product">{FIRM.product}</span>
              <span className="sidebar__firm">{FIRM.name}</span>
            </span>
          )}
        </div>

        <nav className="sidebar__nav">
          <ul>
            {items.map(({ key, path, label, Icon }) => (
              <li key={key}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    cx("sidebar__link", isActive && "sidebar__link--active")
                  }
                  onClick={onCloseMobile}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={19} aria-hidden="true" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {onToggleCollapse && (
          <div className="sidebar__footer">
            <button
              type="button"
              className="sidebar__collapse-btn"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
