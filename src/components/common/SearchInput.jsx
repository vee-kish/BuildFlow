import { useId } from "react";
import { Search, X } from "lucide-react";
import { cx } from "../../utils/cx";
import "./Input.css";
import "./SearchInput.css";

/**
 * Search field with an inline icon and a clear button.
 * `onChange` receives the string value (not an event) for convenience.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  visuallyHideLabel = true,
  className,
  ...rest
}) {
  const id = useId();
  const hasValue = value.length > 0;

  return (
    <div className={cx("search-input", className)}>
      <label
        className={cx("input-field__label", visuallyHideLabel && "sr-only")}
        htmlFor={id}
      >
        {label}
      </label>
      <div className="search-input__control">
        <Search className="search-input__icon" size={16} aria-hidden="true" />
        <input
          id={id}
          type="search"
          className="input-field__input search-input__field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
        {hasValue && (
          <button
            type="button"
            className="search-input__clear"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
