import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Modal } from "../common/Modal";
import { useToast } from "../../context/ToastContext";
import { documentsService } from "../../services/api";
import { ROLES } from "../../data/permissions";
import "./Documents.css";

const CATEGORIES = ["Drawings", "BOQ", "Contracts", "Reports", "Permits", "Other"];

export const DOCUMENT_CATEGORIES = CATEGORIES;

export function UploadDocumentModal({
  open,
  onClose,
  projects = [],
  currentUserId,
  currentUserRole,
  onUploaded,
}) {
  const { show } = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    projectId: "",
    category: "Drawings",
    clientVisible: false,
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isClient = currentUserRole === ROLES.CLIENT_VIEWER;
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  const reset = () => {
    setForm({ title: "", projectId: "", category: "Drawings", clientVisible: false });
    setFile(null);
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (e) => {
    const chosen = e.target.files?.[0] ?? null;
    setFile(chosen);
    if (chosen && !form.title.trim()) {
      setForm((f) => ({ ...f, title: chosen.name.replace(/\.[^.]+$/, "") }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "A document title is required.";
    if (!form.projectId) next.projectId = "Select a project.";
    if (!file) next.file = "Choose a file to upload.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const created = await documentsService.upload({
        title: form.title.trim(),
        projectId: form.projectId,
        category: form.category,
        clientVisible: isClient ? true : form.clientVisible,
        fileSize: file.size,
        fileType: ext,
        byId: currentUserId,
      });
      show({ type: "success", title: "Document uploaded", message: created.title });
      onUploaded?.(created);
      handleClose();
    } catch (err) {
      show({ type: "error", title: "Upload failed", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload document"
      description="Uploaded documents start as “Awaiting review” until an approver signs them off."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="upload-doc-form" variant="primary" loading={submitting}>
            Upload
          </Button>
        </>
      }
    >
      <form id="upload-doc-form" onSubmit={handleSubmit} noValidate className="doc-form">
        <div
          className={file ? "doc-dropzone doc-dropzone--filled" : "doc-dropzone"}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Choose a file to upload"
        >
          <UploadCloud size={24} aria-hidden="true" />
          <span>{file ? file.name : "Click to choose a file"}</span>
          {file && (
            <span className="doc-dropzone__size">
              {(file.size / 1_000_000).toFixed(1)} MB
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            onChange={handleFile}
            tabIndex={-1}
          />
        </div>
        {errors.file && (
          <p className="input-field__error" role="alert">
            {errors.file}
          </p>
        )}

        <Input
          label="Document title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
          placeholder="e.g. Structural GA Drawings — Rev D"
        />
        <Select
          label="Project"
          value={form.projectId}
          placeholder="Select a project"
          options={projectOptions}
          onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
          error={errors.projectId}
        />
        <Select
          label="Category"
          value={form.category}
          options={CATEGORIES}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />
        {!isClient && (
          <label className="doc-checkbox">
            <input
              type="checkbox"
              checked={form.clientVisible}
              onChange={(e) => setForm((f) => ({ ...f, clientVisible: e.target.checked }))}
            />
            Visible to client viewer
          </label>
        )}
      </form>
    </Modal>
  );
}
