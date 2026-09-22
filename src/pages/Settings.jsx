import { useState } from "react";
import {
  Building2,
  CreditCard,
  Database,
  Download,
  HardDrive,
  Lock,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { Tabs, TabPanel } from "../components/common/Tabs";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import { settingsService } from "../services/api";
import { ROLES } from "../data/permissions";
import { formatCurrencyKES, formatDate } from "../utils/format";
import "./Settings.css";

function formatBytes(bytes) {
  if (!bytes) return "0 GB";
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}

export default function Settings() {
  const { user, can } = useAuth();
  const [tab, setTab] = useState("firm");

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        settingsService.getFirm(),
        settingsService.getPersonal(user.id),
        settingsService.getBilling(),
        settingsService.getStorage(),
      ]).then(([firm, personal, billing, storage]) => ({
        firm,
        personal,
        billing,
        storage,
      })),
    [user.id]
  );

  if (loading) {
    return (
      <div className="settings">
        <PageHeader title="Settings" />
        <LoadingState variant="skeleton" rows={8} label="Loading settings" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings">
        <PageHeader title="Settings" />
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title="Couldn't load settings"
            description={error.message}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      </div>
    );
  }

  const isAdmin = user.role === ROLES.ADMIN;

  const tabs = [
    { id: "firm", label: "Firm profile", icon: Building2 },
    { id: "personal", label: "Personal", icon: UserIcon },
    { id: "security", label: "Security", icon: Lock },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "privacy", label: "Data & privacy", icon: Database },
    can("canAccessBilling") && { id: "billing", label: "Billing", icon: CreditCard },
  ].filter(Boolean);

  return (
    <div className="settings">
      <PageHeader
        title="Settings"
        subtitle="Manage your firm, profile, security and subscription."
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} ariaLabel="Settings sections" />

      {tab === "firm" && (
        <TabPanel id="firm">
          <FirmSection initial={data.firm} canEdit={isAdmin} />
        </TabPanel>
      )}
      {tab === "personal" && (
        <TabPanel id="personal">
          <PersonalSection initial={data.personal} userId={user.id} />
        </TabPanel>
      )}
      {tab === "security" && (
        <TabPanel id="security">
          <SecuritySection userName={user.name} userEmail={user.email} />
        </TabPanel>
      )}
      {tab === "storage" && (
        <TabPanel id="storage">
          <StorageSection initial={data.storage} />
        </TabPanel>
      )}
      {tab === "privacy" && (
        <TabPanel id="privacy">
          <PrivacySection
            canExport={can("canExportData")}
            canDelete={can("canDeleteAccount")}
          />
        </TabPanel>
      )}
      {tab === "billing" && can("canAccessBilling") && (
        <TabPanel id="billing">
          <BillingSection initial={data.billing} />
        </TabPanel>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FirmSection({ initial, canEdit }) {
  const { show } = useToast();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateFirm(form);
      show({ type: "success", title: "Firm profile updated" });
    } catch (err) {
      show({ type: "error", title: "Could not save", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Firm profile" subtitle={canEdit ? "Your organisation's public details." : "Read-only — only admins can edit."}>
      <form className="settings-form" onSubmit={handleSave}>
        <Input
          label="Firm name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          disabled={!canEdit}
        />
        <div className="settings-form__row">
          <Input
            label="Contact email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="settings-form__row">
          <Input
            label="Website"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label="KRA PIN"
            value={form.kraPin}
            onChange={(e) => set("kraPin", e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          disabled={!canEdit}
        />
        {canEdit && (
          <div className="settings-form__actions">
            <Button type="submit" variant="primary" loading={saving}>
              Save changes
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}

function PersonalSection({ initial, userId }) {
  const { show } = useToast();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    title: initial?.title ?? "",
    email: initial?.email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updatePersonal(userId, form);
      show({ type: "success", title: "Profile updated" });
    } catch (err) {
      show({ type: "error", title: "Could not save", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Personal profile" subtitle="How you appear to your team.">
      <form className="settings-form" onSubmit={handleSave}>
        <Input label="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <div className="settings-form__row">
          <Input label="Job title" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            hint="Contact your admin to change your sign-in email."
          />
        </div>
        <div className="settings-form__actions">
          <Button type="submit" variant="primary" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function SecuritySection({ userName, userEmail }) {
  const { show } = useToast();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [twoFactor, setTwoFactor] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setPw((f) => ({ ...f, [key]: value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const next = {};
    if (!pw.current) next.current = "Enter your current password.";
    if (pw.next.length < 8) next.next = "Use at least 8 characters.";
    if (pw.next !== pw.confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    // Demo only: no real credential store is wired up yet.
    await new Promise((r) => setTimeout(r, 350));
    setSaving(false);
    setPw({ current: "", next: "", confirm: "" });
    show({ type: "success", title: "Password updated", message: "Demo only — not persisted." });
  };

  return (
    <div className="settings__stack">
      <Card title="Password" subtitle={`Signed in as ${userName} (${userEmail})`}>
        <form className="settings-form" onSubmit={handleChangePassword} noValidate>
          <Input
            label="Current password"
            passwordToggle
            autoComplete="current-password"
            value={pw.current}
            onChange={(e) => set("current", e.target.value)}
            error={errors.current}
          />
          <div className="settings-form__row">
            <Input
              label="New password"
              passwordToggle
              autoComplete="new-password"
              value={pw.next}
              onChange={(e) => set("next", e.target.value)}
              error={errors.next}
            />
            <Input
              label="Confirm new password"
              passwordToggle
              autoComplete="new-password"
              value={pw.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              error={errors.confirm}
            />
          </div>
          <div className="settings-form__actions">
            <Button type="submit" variant="primary" loading={saving}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Two-factor authentication" subtitle="Add an extra layer of security to your account.">
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={twoFactor}
            onChange={(e) => {
              setTwoFactor(e.target.checked);
              show({
                type: "info",
                title: e.target.checked ? "2FA enabled" : "2FA disabled",
                message: "Demo only — authentication backend not wired up.",
              });
            }}
          />
          <span>
            <span className="settings-toggle__label">Enable two-factor authentication</span>
            <span className="settings-toggle__hint">
              We'll ask for a code from your authenticator app at sign-in.
            </span>
          </span>
        </label>
      </Card>
    </div>
  );
}

function StorageSection({ initial }) {
  const { show } = useToast();
  const pct = Math.min(100, Math.round((initial.usedBytes / initial.totalBytes) * 100));

  return (
    <Card title="Storage" subtitle="Document and photo storage across all projects.">
      <div className="storage">
        <div className="storage__head">
          <span className="storage__used">
            {formatBytes(initial.usedBytes)} of {formatBytes(initial.totalBytes)} used
          </span>
          <span className="storage__pct">{pct}%</span>
        </div>
        <div
          className="storage__bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Storage used"
        >
          <div className="storage__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="storage__actions">
          <Button
            variant="secondary"
            onClick={() =>
              show({ type: "info", title: "Upgrade storage", message: "Billing flows arrive in a later phase." })
            }
          >
            Upgrade storage
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PrivacySection({ canExport, canDelete }) {
  const { show } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = () => {
    show({
      type: "success",
      title: "Export requested",
      message: "In the full product we'll email a download link for all your data.",
    });
  };

  const handleDelete = () => {
    setConfirmOpen(false);
    show({
      type: "info",
      title: "Account deletion",
      message: "Demo only — no account was deleted.",
    });
  };

  return (
    <div className="settings__stack">
      <Card title="Export your data" subtitle="Download a copy of all firm data as CSV/JSON.">
        <div className="settings-row">
          <div className="settings-row__text">
            <p className="settings-row__title">Data export</p>
            <p className="settings-row__desc">
              Includes projects, documents metadata, issues and activity.
            </p>
          </div>
          <Button variant="secondary" onClick={handleExport} disabled={!canExport}>
            <Download size={16} aria-hidden="true" />
            Request export
          </Button>
        </div>
      </Card>

      {canDelete && (
        <Card title="Danger zone" subtitle="These actions are destructive and cannot be undone.">
          <div className="settings-row settings-row--danger">
            <div className="settings-row__text">
              <p className="settings-row__title">Delete firm account</p>
              <p className="settings-row__desc">
                Permanently remove all projects, documents and team access.
              </p>
            </div>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 size={16} aria-hidden="true" />
              Delete account
            </Button>
          </div>
        </Card>
      )}

      {confirmOpen && (
        <Modal
          open
          onClose={() => setConfirmOpen(false)}
          title="Delete firm account?"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Yes, delete
              </Button>
            </>
          }
        >
          <p className="settings-confirm">
            This will permanently delete the firm account and all associated data.
            This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

function BillingSection({ initial }) {
  const { show } = useToast();
  const seatPct = Math.round((initial.seatsUsed / initial.seats) * 100);

  return (
    <div className="settings__stack">
      <Card title="Subscription" subtitle="Your current plan and seat usage.">
        <div className="billing">
          <div className="billing__plan">
            <div>
              <p className="billing__plan-name">{initial.plan} plan</p>
              <p className="billing__plan-price">
                {formatCurrencyKES(initial.monthlyKES)} / month
              </p>
            </div>
            <span className="billing__status">{initial.status}</span>
          </div>
          <div className="billing__row">
            <span>Seats</span>
            <strong>
              {initial.seatsUsed} of {initial.seats} used ({seatPct}%)
            </strong>
          </div>
          <div className="billing__row">
            <span>Renewal date</span>
            <strong>{formatDate(initial.renewalDate)}</strong>
          </div>
          <div className="settings-form__actions">
            <Button
              variant="secondary"
              onClick={() =>
                show({ type: "info", title: "Change plan", message: "Billing management arrives in a later phase." })
              }
            >
              Change plan
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                show({ type: "info", title: "Payment methods", message: "Billing management arrives in a later phase." })
              }
            >
              <CreditCard size={16} aria-hidden="true" />
              Manage payment
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
