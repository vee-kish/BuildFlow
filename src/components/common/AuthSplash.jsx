import { HardHat, Loader2 } from "lucide-react";

/** Full-screen splash shown while the auth session is restored. */
export function AuthSplash({ label = "Restoring your session…" }) {
  return (
    <div className="auth-splash" role="status" aria-live="polite">
      <span className="auth-splash__mark" aria-hidden="true">
        <HardHat size={28} />
      </span>
      <Loader2 className="auth-splash__spinner" size={24} aria-hidden="true" />
      <p className="auth-splash__text">{label}</p>
    </div>
  );
}
