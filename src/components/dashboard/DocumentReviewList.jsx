import { FileText } from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import { Button } from "../common/Button";
import { getProjectById, getUserById } from "../../data/mockData";
import { formatRelativeTime } from "../../utils/format";

export function DocumentReviewList({ documents, onAction, emptyMessage = "No documents awaiting review." }) {
  if (documents.length === 0) {
    return <p className="dash-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="doc-list">
      {documents.map((doc) => {
        const project = getProjectById(doc.projectId);
        const uploader = getUserById(doc.uploadedBy);
        return (
          <li key={doc.id} className="doc-list__item">
            <span className="doc-list__icon" aria-hidden="true">
              <FileText size={16} />
            </span>
            <div className="doc-list__body">
              <p className="doc-list__title">{doc.title}</p>
              <p className="doc-list__meta">
                {project?.name} · {doc.category} · {uploader?.name} ·{" "}
                {formatRelativeTime(doc.updatedAt)}
              </p>
            </div>
            <StatusBadge status={doc.status} />
            {onAction && doc.status === "awaiting-review" && (
              <Button size="sm" variant="secondary" onClick={() => onAction(doc)}>
                Review
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
