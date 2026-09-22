import { useRef, useState } from "react";
import { History, UploadCloud } from "lucide-react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { useToast } from "../../context/ToastContext";
import { documentsService } from "../../services/api";
import { formatDate } from "../../utils/format";
import "./Documents.css";

export function DocumentVersionsModal({
  open,
  onClose,
  document,
  users = [],
  currentUserId,
  canUpload,
  onUpdated,
}) {
  const { show } = useToast();
  const fileRef = useRef(null);
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!document) return null;

  const userMap = {};
  users.forEach((u) => {
    userMap[u.id] = u;
  });

  const handleClose = () => {
    setNote("");
    setFile(null);
    onClose();
  };

  const handleAddVersion = async (e) => {
    e.preventDefault();
    if (!file) {
      show({ type: "error", title: "Choose a file", message: "Select the revised file to upload." });
      return;
    }
    setSubmitting(true);
    try {
      const updated = await documentsService.addVersion(document.id, {
        note: note.trim() || (file ? `Uploaded ${file.name}` : ""),
        byId: currentUserId,
      });
      show({ type: "success", title: "Version added", message: `Now v${updated.version}` });
      setNote("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onUpdated?.();
    } catch (err) {
      show({ type: "error", title: "Could not add version", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Version history"
      description={document.title}
      size="md"
    >
      <ol className="doc-versions">
        {document.versions.map((v) => (
          <li key={v.version} className="doc-versions__item">
            <span className="doc-versions__badge">v{v.version}</span>
            <div className="doc-versions__body">
              <p className="doc-versions__note">{v.note}</p>
              <p className="doc-versions__meta">
                {userMap[v.updatedBy]?.name ?? "Unknown"} · {formatDate(v.updatedAt)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {canUpload && (
        <form className="doc-newversion" onSubmit={handleAddVersion}>
          <h3 className="doc-newversion__title">
            <History size={16} aria-hidden="true" />
            Upload a new version
          </h3>
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
            aria-label="Choose a revised file"
          >
            <UploadCloud size={20} aria-hidden="true" />
            <span>{file ? file.name : "Choose revised file"}</span>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              tabIndex={-1}
            />
          </div>
          <div className="input-field">
            <label className="input-field__label" htmlFor="version-note">
              What changed?
            </label>
            <input
              id="version-note"
              className="input-field__input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Incorporated RFI-112 detail"
            />
          </div>
          <Button type="submit" variant="primary" loading={submitting}>
            Add version
          </Button>
        </form>
      )}
    </Modal>
  );
}
