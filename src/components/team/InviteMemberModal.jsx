import { useState } from "react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Modal } from "../common/Modal";
import { Avatar } from "../common/Avatar";
import { useToast } from "../../context/ToastContext";
import { teamService } from "../../services/api";
import { ROLES, ROLE_LABELS } from "../../data/permissions";
import "./Team.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = Object.values(ROLES).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

const emptyForm = {
  name: "",
  email: "",
  role: ROLES.SITE_TEAM,
  title: "",
  projectIds: [],
};

export function InviteMemberModal({ open, onClose, projects = [], currentUserId, onInvited }) {
  const { show } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleProject = (id) =>
    setForm((f) => ({
      ...f,
      projectIds: f.projectIds.includes(id)
        ? f.projectIds.filter((p) => p !== id)
        : [...f.projectIds, id],
    }));

  const handleClose = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.email.trim()) next.email = "Work email is required.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Enter a valid email address.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await teamService.invite({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        title: form.title.trim(),
        projectIds: form.projectIds,
        byId: currentUserId,
      });
      show({ type: "success", title: "Invitation sent", message: `${created.name} · ${ROLE_LABELS[created.role]}` });
      onInvited?.(created);
      handleClose();
    } catch (err) {
      show({ type: "error", title: "Could not invite member", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite a team member"
      description="They'll receive an email invitation and join with the role and project access you set here."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="invite-form" variant="primary" loading={submitting}>
            Send invite
          </Button>
        </>
      }
    >
      <form id="invite-form" onSubmit={handleSubmit} noValidate className="team-form">
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
          placeholder="e.g. John Kamau"
        />
        <Input
          label="Work email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
          placeholder="name@firm.co.ke"
        />
        <div className="team-form__row">
          <Select
            label="Role"
            value={form.role}
            options={ROLE_OPTIONS}
            onChange={(e) => set("role", e.target.value)}
          />
          <Input
            label="Job title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Quantity Surveyor"
          />
        </div>

        <fieldset className="team-projects">
          <legend className="input-field__label">Project access</legend>
          {projects.length === 0 ? (
            <p className="team-form__hint">No projects available.</p>
          ) : (
            <div className="team-projects__list">
              {projects.map((p) => (
                <label key={p.id} className="team-projects__option">
                  <input
                    type="checkbox"
                    checked={form.projectIds.includes(p.id)}
                    onChange={() => toggleProject(p.id)}
                  />
                  <Avatar name={p.name} size="sm" />
                  <span className="team-projects__name">{p.name}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      </form>
    </Modal>
  );
}
