import { Bell, LogOut, Menu, Settings, User } from "lucide-react";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
} from "../common/Dropdown";
import { Avatar } from "../common/Avatar";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { notificationsService } from "../../services/api";
import { formatRelativeTime } from "../../utils/format";
import { ROLE_LABELS } from "../../data/permissions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

export function Topbar({ onOpenMobileNav, onToggleSidebar, sidebarCollapsed }) {
  const { user, logout } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationsService.list().then(setNotifications);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        {onToggleSidebar && (
          <button
            type="button"
            className="topbar__icon-btn topbar__desktop-only"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={20} />
          </button>
        )}
        <button
          type="button"
          className="topbar__icon-btn topbar__mobile-only"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="topbar__right">
        <RoleSwitcher />

        <Dropdown
          label="Notifications"
          trigger={({ open, menuId }) => (
            <button
              type="button"
              className="topbar__icon-btn"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? menuId : undefined}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="topbar__badge" aria-hidden="true">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          menuClassName="topbar__notifications-menu"
        >
          <DropdownLabel>Notifications</DropdownLabel>
          {notifications.length === 0 && (
            <p className="topbar__empty">You're all caught up.</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`topbar__notification${n.unread ? " topbar__notification--unread" : ""}`}
            >
              <p className="topbar__notification-title">{n.title}</p>
              <p className="topbar__notification-detail">{n.detail}</p>
              <p className="topbar__notification-time">
                {formatRelativeTime(n.timestamp)}
              </p>
            </div>
          ))}
        </Dropdown>

        <Dropdown
          label="Account menu"
          trigger={({ open, menuId }) => (
            <button
              type="button"
              className="topbar__user"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? menuId : undefined}
            >
              <Avatar name={user.name} size="sm" />
              <span className="topbar__user-info">
                <span className="topbar__user-name">{user.name}</span>
                <span className="topbar__user-role">{ROLE_LABELS[user.role]}</span>
              </span>
            </button>
          )}
        >
          <DropdownLabel>
            {user.name} · {user.title}
          </DropdownLabel>
          <DropdownItem
            icon={User}
            onSelect={() => show({ type: "info", title: "Profile", message: "Profile page arrives in a later phase." })}
          >
            View profile
          </DropdownItem>
          <DropdownItem
            icon={Settings}
            onSelect={() => navigate("/settings")}
          >
            Settings
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={LogOut} danger onSelect={handleLogout}>
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
