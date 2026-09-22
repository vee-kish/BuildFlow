import { useState } from "react";
import { Button } from "../common/Button";
import { Select } from "../common/Select";
import { Modal } from "../common/Modal";
import { Avatar } from "../common/Avatar";
import { useToast } from "../../context/ToastContext";
import { teamService } from "../../services/api";
import { ROLES, ROLE_LABELS } from "../../data/permissions";
import "./Team.css";

const ROLE_OPTIONS = Object.values(ROLES).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "deactivated", label: "Deactivated" },
];

export function ManageMemberModal({ open, onClose, member, projects = [], onSaved }) {
  const { show } = useToast();
  const [role, setRole] = useState(member.role);
  const [status, setStatus] = useState(member.status ?? "active");
  const [projectIds, setProjectIds] = useState(member.projectIds ?? []);
  const [saving, setSaving] = useState(false);

  const toggleProject = (id) =>
    setProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const handleClose = () => onClose();

  const handleSave = async () => {
    setSaving(true);
    try {
      await teamService.updateMember(member.id, { role, status, projectIds });
      show({ type: "success", title: "Member updated", message: member.name });
      onSaved?.();
      handleClose();
    } catch (err) {
      show({ type: "error", title: "Could not update member", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Manage team member"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="team-form">
        <div className="team-manage__member">
          <Avatar name={member.name} size="lg" />
          <div>
            <p className="team-manage__name">{member.name}</p>
            <p className="team-manage__email">{member.email}</p>
          </div>
        </div>

        <div className="team-form__row">
          <Select
            label="Role"
            value={role}
            options={ROLE_OPTIONS}
            onChange={(e) => setRole(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>

        <fieldset className="team-projects">
          <legend className="input-field__label">Project access</legend>
          <div className="team-projects__list">
            {projects.map((p) => (
              <label key={p.id} className="team-projects__option">
                <input
                  type="checkbox"
                  checked={projectIds.includes(p.id)}
                  onChange={() => toggleProject(p.id)}
                />
                <Avatar name={p.name} size="sm" />
                <span className="team-projects__name">{p.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </Modal>
  );
}
