import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Modal } from "../common/Modal";
import { useToast } from "../../context/ToastContext";
import { issuesService } from "../../services/api";
import { ROLES } from "../../data/permissions";
import "./Issues.css";

const SEVERITIES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const emptyForm = {
  title: "",
  projectId: "",
  severity: "medium",
  description: "",
  assigneeId: "",
  dueDate: "",
  location: "",
};

/**
 * Create-issue modal.
 * variant="site" adds a location field and photo attachments for site reporting.
 */
export function IssueFormModal({
  open,
  onClose,
  variant = "standard",
  projects = [],
  users = [],
  currentUserId,
  defaultProjectId = "",
  onCreated,
}) {
  const { show } = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ ...emptyForm, projectId: defaultProjectId });
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isSite = variant === "site";
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const assignees = users.filter((u) => u.role !== ROLES.CLIENT_VIEWER);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleClose = () => {
    setForm({ ...emptyForm, projectId: defaultProjectId });
    setPhotos([]);
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  };

  const handleFiles = (e) => {
    const chosen = [...(e.target.files ?? [])].map((f) => ({
      name: f.name,
      size: f.size,
    }));
    setPhotos((prev) => [...prev, ...chosen]);
  };

  const removePhoto = (index) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "A short title is required.";
    if (!form.projectId) next.projectId = "Select a project.";
    if (isSite && !form.description.trim())
      next.description = "Describe what you observed on site.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await issuesService.create({
        title: form.title.trim(),
        projectId: form.projectId,
        severity: form.severity,
        description: form.description.trim(),
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
        location: isSite ? form.location.trim() : "",
        photos: isSite ? photos : [],
        byId: currentUserId,
      });
      show({ type: "success", title: "Issue reported", message: created.title });
      onCreated?.(created);
      handleClose();
    } catch (err) {
      show({ type: "error", title: "Could not create issue", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isSite ? "Report a site issue" : "Create issue"}
      description={
        isSite
          ? "Capture the problem with photos so the team can act fast."
          : "Log an issue or RFI and assign it to the right person."
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="issue-form" variant="primary" loading={submitting}>
            {isSite ? "Submit report" : "Create issue"}
          </Button>
        </>
      }
    >
      <form id="issue-form" onSubmit={handleSubmit} noValidate className="issue-form">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          error={errors.title}
          placeholder="e.g. Water ingress at level 4 slab joint"
        />
        <div className="issue-form__row">
          <Select
            label="Project"
            value={form.projectId}
            placeholder="Select a project"
            options={projectOptions}
            onChange={(e) => set("projectId", e.target.value)}
            error={errors.projectId}
          />
          <Select
            label="Severity"
            value={form.severity}
            options={SEVERITIES}
            onChange={(e) => set("severity", e.target.value)}
          />
        </div>

        {isSite && (
          <Input
            label="Site location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Level 4, north slab"
          />
        )}

        <div className="input-field">
          <label className="input-field__label" htmlFor="issue-description">
            Description
          </label>
          <textarea
            id="issue-description"
            className="input-field__input issue-form__textarea"
            rows={isSite ? 4 : 3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? "issue-description-error" : undefined}
            placeholder={
              isSite
                ? "What did you observe? Include measurements or references if known."
                : "Add context, references, or steps to reproduce."
            }
          />
          {errors.description && (
            <p className="input-field__error" id="issue-description-error" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        {isSite && (
          <div className="issue-form__photos">
            <span className="input-field__label">Photos</span>
            <div
              className="issue-photo-add"
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              aria-label="Add photos"
            >
              <Camera size={18} aria-hidden="true" />
              <span>Add photos</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleFiles}
                tabIndex={-1}
              />
            </div>
            {photos.length > 0 && (
              <ul className="issue-photo-list">
                {photos.map((p, i) => (
                  <li key={`${p.name}-${i}`} className="issue-photo">
                    <Camera size={14} aria-hidden="true" />
                    <span className="issue-photo__name">{p.name}</span>
                    <button
                      type="button"
                      className="issue-photo__remove"
                      onClick={() => removePhoto(i)}
                      aria-label={`Remove ${p.name}`}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="issue-form__row">
          <Select
            label="Assign to"
            value={form.assigneeId}
            placeholder="Unassigned"
            options={assignees.map((u) => ({ value: u.id, label: u.name }))}
            onChange={(e) => set("assigneeId", e.target.value)}
          />
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
