import { useRef } from "react";
import { cx } from "../../utils/cx";
import "./Tabs.css";

/**
 * Accessible horizontal tabs.
 * `tabs` is an array of { id, label, icon?, count? }.
 * Arrow keys move focus and activate; Home/End jump to the ends.
 */
export function Tabs({ tabs, active, onChange, ariaLabel = "Section tabs", className }) {
  const refs = useRef([]);

  const focusTab = (index) => {
    const tab = tabs[index];
    if (!tab) return;
    onChange(tab.id);
    refs.current[index]?.focus();
  };

  const onKeyDown = (e, index) => {
    let next = null;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next !== null) {
      e.preventDefault();
      focusTab(next);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx("tabs", className)}
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={cx("tabs__tab", selected && "tabs__tab--active")}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className="tabs__count">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Panel wrapper that pairs with a Tabs id for correct ARIA wiring. */
export function TabPanel({ id, children, className, labelledBy }) {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={labelledBy ?? `tab-${id}`}
      tabIndex={0}
      className={cx("tabs__panel", className)}
    >
      {children}
    </div>
  );
}
