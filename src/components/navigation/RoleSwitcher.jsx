import { Check } from "lucide-react";
import { Dropdown, DropdownItem, DropdownLabel } from "../common/Dropdown";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from "../../data/permissions";
import "./RoleSwitcher.css";

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const { show } = useToast();

  if (!user) return null;

  const handleSwitch = (role) => {
    if (role === user.role) return;
    switchRole(role);
    show({
      type: "info",
      title: "Viewing as " + ROLE_LABELS[role],
      message: "Dashboard and navigation updated for this demo role.",
    });
  };

  return (
    <Dropdown
      label="Switch demo role"
      trigger={({ open, menuId }) => (
        <button
          type="button"
          className="role-switcher__trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
        >
          <span className="role-switcher__current">{ROLE_LABELS[user.role]}</span>
          <span className="role-switcher__hint">Demo role</span>
        </button>
      )}
      menuClassName="role-switcher__menu"
    >
      <DropdownLabel>View app as</DropdownLabel>
      {Object.values(ROLES).map((role) => (
        <DropdownItem
          key={role}
          onSelect={() => handleSwitch(role)}
        >
          <span className="role-switcher__option">
            <span className="role-switcher__option-label">{ROLE_LABELS[role]}</span>
            <span className="role-switcher__option-desc">{ROLE_DESCRIPTIONS[role]}</span>
          </span>
          {user.role === role && (
            <Check size={16} className="role-switcher__check" aria-label="Current role" />
          )}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
