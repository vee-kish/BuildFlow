import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createPortal } from "react-dom";
import "./Toast.css";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] ?? Info;
        return (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            role="status"
            aria-live="polite"
          >
            <Icon className="toast__icon" size={18} aria-hidden="true" />
            <div className="toast__content">
              {toast.title && <p className="toast__title">{toast.title}</p>}
              {toast.message && <p className="toast__message">{toast.message}</p>}
            </div>
            <button
              type="button"
              className="toast__dismiss"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
