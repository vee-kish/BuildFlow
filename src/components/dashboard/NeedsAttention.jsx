import { AlertTriangle, FileText } from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import { getProjectById, getUserById } from "../../data/mockData";
import { formatDate } from "../../utils/format";

export function NeedsAttention({ issues, documents }) {
  const urgentIssues = issues.filter((i) => i.overdue || i.severity === "high");
  const pendingDocs = documents.filter((d) => d.status === "awaiting-review");
  const isEmpty = urgentIssues.length === 0 && pendingDocs.length === 0;

  if (isEmpty) {
    return <p className="dash-empty">Nothing needs attention right now.</p>;
  }

  return (
    <ul className="attention-list">
      {urgentIssues.map((issue) => {
        const project = getProjectById(issue.projectId);
        const assignee = getUserById(issue.assigneeId);
        return (
          <li key={issue.id} className="attention-list__item">
            <span className="attention-list__icon attention-list__icon--danger" aria-hidden="true">
              <AlertTriangle size={16} />
            </span>
            <div className="attention-list__body">
              <p className="attention-list__title">{issue.title}</p>
              <p className="attention-list__meta">
                {project?.name} · {assignee?.name ?? "Unassigned"}
                {issue.dueDate ? ` · due ${formatDate(issue.dueDate)}` : ""}
              </p>
            </div>
            <StatusBadge status={issue.overdue ? "overdue" : issue.severity} />
          </li>
        );
      })}
      {pendingDocs.map((doc) => {
        const project = getProjectById(doc.projectId);
        return (
          <li key={doc.id} className="attention-list__item">
            <span className="attention-list__icon attention-list__icon--warning" aria-hidden="true">
              <FileText size={16} />
            </span>
            <div className="attention-list__body">
              <p className="attention-list__title">{doc.title}</p>
              <p className="attention-list__meta">
                {project?.name} · {doc.category}
              </p>
            </div>
            <StatusBadge status={doc.status} />
          </li>
        );
      })}
    </ul>
  );
}
