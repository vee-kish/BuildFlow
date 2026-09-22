import { useState } from "react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Modal } from "../common/Modal";
import { Avatar } from "../common/Avatar";
import { useToast } from "../../context/ToastContext";
import { projectsService } from "../../services/api";
import { ROLES, ROLE_LABELS } from "../../data/permissions";
import "./CreateProjectModal.css";

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
];

const emptyForm = {
  name: "",
  client: "",
  location: "",
  status: "planning",
  startDate: "",
  targetDate: "",
  budgetKES: "",
  managerId: "",
  description: "",
  team: [],
};

export function CreateProjectModal({ open, onClose, users = [], currentUserId, onCreated }) {
  const { show } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const managers = users.filter(
    (u) => u.role === ROLES.ADMIN || u.role === ROLES.PROJECT_MANAGER
  );
  const teamCandidates = users.filter((u) => u.role !== ROLES.CLIENT_VIEWER);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleTeam = (id) =>
    setForm((f) => ({
      ...f,
      team: f.team.includes(id) ? f.team.filter((t) => t !== id) : [...f.team, id],
    }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Project name is required.";
    if (!form.client.trim()) next.client = "Client is required.";
    if (!form.location.trim()) next.location = "Location is required.";
    if (!form.targetDate) next.targetDate = "Target completion date is required.";
    if (
      form.startDate &&
      form.targetDate &&
      new Date(form.startDate) > new Date(form.targetDate)
    ) {
      next.targetDate = "Target date must be after the start date.";
    }
    if (form.budgetKES && Number(form.budgetKES) < 0) {
      next.budgetKES = "Budget cannot be negative.";
    }
    return next;
  };

  const handleClose = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await projectsService.create({
        name: form.name.trim(),
        client: form.client.trim(),
        location: form.location.trim(),
        status: form.status,
        startDate: form.startDate || null,
        targetDate: form.targetDate,
        budgetKES: form.budgetKES || 0,
        managerId: form.managerId || currentUserId,
        description: form.description.trim(),
        team: form.team,
        byId: currentUserId,
      });
      show({ type: "success", title: "Project created", message: created.name });
      onCreated?.(created);
      handleClose();
    } catch (err) {
      show({ type: "error", title: "Could not create project", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create a new project"
      description="Set up the basics. You can add documents, milestones and team members afterwards."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-project-form" variant="primary" loading={submitting}>
            Create project
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit} noValidate className="cpm-form">
        <Input
          label="Project name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
          placeholder="e.g. Lavington Townhouses"
        />
        <div className="cpm-row">
          <Input
            label="Client"
            value={form.client}
            onChange={(e) => set("client", e.target.value)}
            error={errors.client}
            placeholder="Client organisation"
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            error={errors.location}
            placeholder="Estate, city"
          />
        </div>
        <div className="cpm-row">
          <Select
            label="Status"
            value={form.status}
            options={STATUS_OPTIONS}
            onChange={(e) => set("status", e.target.value)}
          />
          <Select
            label="Project manager"
            value={form.managerId}
            placeholder="Assign later"
            onChange={(e) => set("managerId", e.target.value)}
            options={managers.map((m) => ({ value: m.id, label: m.name }))}
          />
        </div>
        <div className="cpm-row">
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
          <Input
            label="Target completion"
            type="date"
            value={form.targetDate}
            onChange={(e) => set("targetDate", e.target.value)}
            error={errors.targetDate}
          />
        </div>
        <Input
          label="Budget (KES)"
          type="number"
          min="0"
          step="100000"
          value={form.budgetKES}
          onChange={(e) => set("budgetKES", e.target.value)}
          error={errors.budgetKES}
          placeholder="e.g. 120000000"
          hint="Optional. Used for high-level budget tracking."
        />
        <div className="input-field">
          <label className="input-field__label" htmlFor="cpm-description">
            Description
          </label>
          <textarea
            id="cpm-description"
            className="input-field__input cpm-textarea"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short scope summary"
          />
        </div>

        <fieldset className="cpm-team">
          <legend className="input-field__label">Team members</legend>
          <div className="cpm-team__list">
            {teamCandidates.map((u) => (
              <label key={u.id} className="cpm-team__option">
                <input
                  type="checkbox"
                  checked={form.team.includes(u.id)}
                  onChange={() => toggleTeam(u.id)}
                />
                <Avatar name={u.name} size="sm" />
                <span className="cpm-team__info">
                  <span className="cpm-team__name">{u.name}</span>
                  <span className="cpm-team__role">{ROLE_LABELS[u.role]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
