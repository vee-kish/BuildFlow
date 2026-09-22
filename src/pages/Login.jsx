import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileText,
  HardHat,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { Avatar } from "../components/common/Avatar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/api";
import { USERS, DEMO_PASSWORD, FIRM } from "../data/mockData";
import { ROLE_LABELS } from "../data/permissions";
import "./Login.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BRAND_POINTS = [
  { icon: Building2, text: "Track projects, milestones and progress in one place" },
  { icon: FileText, text: "Control drawings, RFIs and document approvals" },
  { icon: ShieldCheck, text: "Report and resolve site issues fast" },
  { icon: Users, text: "Give clients transparent, read-only visibility" },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { show } = useToast();

  // Preserve the route the user was heading to before being redirected here.
  const redirectTo = location.state?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Work email is required.";
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { user } = await authService.login(email, password);
      login(user, { remember });
      show({ type: "success", title: `Welcome back, ${user.name.split(" ")[0]}` });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setDemoLoading(true);
    try {
      const { user } = await authService.loginAsDemo(role);
      login(user, { remember: true });
      setDemoOpen(false);
      show({
        type: "success",
        title: `Signed in as ${ROLE_LABELS[role]}`,
        message: "Demo session — switch roles any time from the topbar.",
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="login">
      <aside className="login__brand" aria-label="About BuildFlow Kenya">
        <div className="login__brand-inner">
          <div className="login__logo">
            <span className="login__logo-mark" aria-hidden="true">
              <HardHat size={24} />
            </span>
            <div>
              <p className="login__product">{FIRM.product}</p>
              <p className="login__firm">{FIRM.name}</p>
            </div>
          </div>

          <h2 className="login__tagline">
            Construction project management, built for Kenyan sites.
          </h2>

          <ul className="login__points">
            {BRAND_POINTS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={18} aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="login__panel">
        <div className="login__form-wrap">
          <div className="login__mobile-logo">
            <span className="login__logo-mark" aria-hidden="true">
              <HardHat size={20} />
            </span>
            <span className="login__product">{FIRM.product}</span>
          </div>

          <h1 className="login__title">Sign in</h1>
          <p className="login__subtitle">
            Use your work email to access your firm's projects.
          </p>

          {formError && (
            <p className="login__form-error" role="alert">
              {formError}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Work email"
              type="email"
              autoComplete="email"
              placeholder="you@firm.co.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div style={{ marginTop: "var(--space-16)" }}>
              <Input
                label="Password"
                passwordToggle
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
            </div>

            <div className="login__row">
              <label className="login__remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                className="login__forgot"
                onClick={() => setForgotOpen(true)}
              >
                Forgot password?
              </button>
            </div>

            <div style={{ marginTop: "var(--space-24)" }}>
              <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="login__divider" role="presentation">
            <span>or</span>
          </div>

          <Button variant="secondary" size="lg" fullWidth onClick={() => setDemoOpen(true)}>
            <Users size={16} aria-hidden="true" />
            Use a demo account
          </Button>

          <p className="login__demo-hint">
            Demo password for email sign-in: <code>{DEMO_PASSWORD}</code>
          </p>
        </div>
      </main>

      <Modal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        title="Choose a demo account"
        description="Explore BuildFlow Kenya from any perspective. You can switch roles later from the topbar."
      >
        <ul className="login__demo-list">
          {USERS.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className="login__demo-item"
                onClick={() => handleDemoLogin(u.role)}
                disabled={demoLoading}
              >
                <Avatar name={u.name} size="md" />
                <span className="login__demo-info">
                  <span className="login__demo-name">{u.name}</span>
                  <span className="login__demo-role">
                    {ROLE_LABELS[u.role]} · {u.title}
                  </span>
                  <span className="login__demo-email">{u.email}</span>
                </span>
                <CheckCircle2 className="login__demo-go" size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset your password"
        size="sm"
        footer={
          <Button variant="secondary" onClick={() => setForgotOpen(false)}>
            Close
          </Button>
        }
      >
        <p className="login__forgot-text">
          Password reset isn't available in this demo yet. In the full product,
          we'll email a secure reset link to your work address. For now, use a
          demo account or the demo password shown on the sign-in page.
        </p>
      </Modal>
    </div>
  );
}
