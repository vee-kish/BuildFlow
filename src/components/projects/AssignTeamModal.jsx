import { useState } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Avatar } from "../common/Avatar";
import { useToast } from "../../context/ToastContext";
import { projectsService } from "../../services/api";
import { ROLE_LABELS } from "../../data/permissions";
import "./CreateProjectModal.css";

export function AssignTeamModal({ open, onClose, project, users = [], onSaved }) {
  const { show } = useToast();
  const [selected, setSelected] = useState(project?.team ?? []);
  const [saving, setSaving] = useState(false);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      await projectsService.update(project.id, { team: selected });
      show({ type: "success", title: "Team updated", message: project.name });
      onSaved?.();
      handleClose();
    } catch (err) {
      show({ type: "error", title: "Could not update team", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Assign team"
      description={project ? `Who is working on ${project.name}?` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save team
          </Button>
        </>
      }
    >
      <div className="cpm-team__list">
        {users.map((u) => (
          <label key={u.id} className="cpm-team__option">
            <input
              type="checkbox"
              checked={selected.includes(u.id)}
              onChange={() => toggle(u.id)}
            />
            <Avatar name={u.name} size="sm" />
            <span className="cpm-team__info">
              <span className="cpm-team__name">{u.name}</span>
              <span className="cpm-team__role">{ROLE_LABELS[u.role]}</span>
            </span>
          </label>
        ))}
      </div>
    </Modal>
  );
}
