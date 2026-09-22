import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "../../utils/cx";
import "./Input.css";
import "./Select.css";

/**
 * Accessible native <select> styled to match <Input/>.
 * `options` is an array of { value, label } or a plain string.
 */
export function Select({
  label,
  error,
  hint,
  options = [],
  placeholder,
  className,
  containerClassName,
  ...rest
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cx("input-field", containerClassName)}>
      {label && (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-field__control select__control">
        <select
          id={id}
          className={cx(
            "input-field__input",
            "select__input",
            error && "input-field__input--error",
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown className="select__chevron" size={18} aria-hidden="true" />
      </div>
      {error && (
        <p className="input-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="input-field__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  );
}
