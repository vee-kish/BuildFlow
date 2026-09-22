import { useEffect, useId, useRef, useState } from "react";
import { cx } from "../../utils/cx";
import "./Dropdown.css";

const ITEM_SELECTOR = '[role="menuitem"]:not([disabled])';

export function Dropdown({
  trigger,
  label,
  menuClassName,
  className,
  align = "right",
  children,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Tab") {
        setOpen(false);
        rootRef.current?.querySelector("[aria-haspopup]")?.focus();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const items = [
          ...(menuRef.current?.querySelectorAll(ITEM_SELECTOR) ?? []),
        ];
        if (items.length === 0) return;
        e.preventDefault();
        const currentIndex = items.indexOf(document.activeElement);
        const next =
          e.key === "ArrowDown"
            ? items[(currentIndex + 1) % items.length]
            : items[(currentIndex - 1 + items.length) % items.length];
        next.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    menuRef.current?.querySelector(ITEM_SELECTOR)?.focus();

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className={cx("dropdown", className)}>
      <div onClick={() => setOpen((v) => !v)}>
        {trigger({ open, menuId, label })}
      </div>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className={cx(
            "dropdown__menu",
            `dropdown__menu--${align}`,
            menuClassName
          )}
          onClick={(e) => {
            if (e.target.closest('[role="menuitem"]')) close();
          }}
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  icon: Icon,
  disabled = false,
  danger = false,
  onSelect,
  children,
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx("dropdown__item", danger && "dropdown__item--danger")}
      disabled={disabled}
      onClick={onSelect}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="dropdown__divider" role="separator" />;
}

export function DropdownLabel({ children }) {
  return <p className="dropdown__label">{children}</p>;
}
