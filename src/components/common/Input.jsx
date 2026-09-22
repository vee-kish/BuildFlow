import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cx } from "../../utils/cx";
import "./Input.css";

export function Input({
  label,
  error,
  hint,
  type = "text",
  passwordToggle = false,
  className,
  containerClassName,
  ...rest
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [revealed, setRevealed] = useState(false);

  const inputType = passwordToggle ? (revealed ? "text" : "password") : type;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cx("input-field", containerClassName)}>
      <label className="input-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="input-field__control">
        <input
          id={id}
          type={inputType}
          className={cx(
            "input-field__input",
            error && "input-field__input--error",
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {passwordToggle && (
          <button
            type="button"
            className="input-field__toggle"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
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
