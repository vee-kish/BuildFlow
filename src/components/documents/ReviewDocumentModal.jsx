import { useState } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { useToast } from "../../context/ToastContext";
import { documentsService } from "../../services/api";
import { cx } from "../../utils/cx";
import "./Documents.css";

const DECISIONS = [
  { value: "approved", label: "Approve", hint: "Mark as approved and notify the uploader." },
  { value: "changes-requested", label: "Request changes", hint: "Send back with comments for revision." },
];

export function ReviewDocumentModal({ open, onClose, document, currentUserId, onReviewed }) {
  const { show } = useToast();
  const [decision, setDecision] = useState("approved");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!document) return null;

  const handleClose = () => {
    setNote("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (decision === "changes-requested" && !note.trim()) {
      show({
        type: "error",
        title: "Comment required",
        message: "Add a comment describing the changes needed.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await documentsService.review(document.id, {
        status: decision,
        note: note.trim(),
        byId: currentUserId,
      });
      show({
        type: "success",
        title: decision === "approved" ? "Document approved" : "Changes requested",
        message: document.title,
      });
      onReviewed?.();
      handleClose();
    } catch (err) {
      show({ type: "error", title: "Review failed", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Review document"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="review-doc-form" variant="primary" loading={submitting}>
            Submit review
          </Button>
        </>
      }
    >
      <form id="review-doc-form" onSubmit={handleSubmit} className="doc-form">
        <div className="doc-review__subject">
          <div>
            <p className="doc-review__title">{document.title}</p>
            <p className="doc-review__meta">
              {document.category} · v{document.version}
            </p>
          </div>
          <StatusBadge status={document.status} />
        </div>

        <fieldset className="doc-decisions">
          <legend className="input-field__label">Decision</legend>
          {DECISIONS.map((d) => (
            <label
              key={d.value}
              className={cx(
                "doc-decision",
                decision === d.value && "doc-decision--active"
              )}
            >
              <input
                type="radio"
                name="decision"
                value={d.value}
                checked={decision === d.value}
                onChange={() => setDecision(d.value)}
              />
              <span className="doc-decision__text">
                <span className="doc-decision__label">{d.label}</span>
                <span className="doc-decision__hint">{d.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="input-field">
          <label className="input-field__label" htmlFor="review-note">
            Comments {decision === "changes-requested" && "(required)"}
          </label>
          <textarea
            id="review-note"
            className="input-field__input doc-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              decision === "approved"
                ? "Optional note for the team"
                : "Describe the changes needed"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
