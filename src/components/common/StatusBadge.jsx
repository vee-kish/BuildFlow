import { cx } from "../../utils/cx";
import "./StatusBadge.css";

const STATUS_MAP = {
  // project statuses
  active: { label: "Active", tone: "success" },
  "on-hold": { label: "On Hold", tone: "warning" },
  completed: { label: "Completed", tone: "info" },
  planning: { label: "Planning", tone: "neutral" },
  // issue / task statuses
  open: { label: "Open", tone: "danger" },
  "in-progress": { label: "In Progress", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
  overdue: { label: "Overdue", tone: "danger" },
  // document statuses
  "awaiting-review": { label: "Awaiting Review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  "changes-requested": { label: "Changes Requested", tone: "danger" },
  draft: { label: "Draft", tone: "neutral" },
  // team member statuses
  invited: { label: "Invited", tone: "warning" },
  // severities
  high: { label: "High", tone: "danger" },
  medium: { label: "Medium", tone: "warning" },
  low: { label: "Low", tone: "neutral" },
  // milestones
  done: { label: "Done", tone: "success" },
  upcoming: { label: "Upcoming", tone: "neutral" },
};

export function StatusBadge({ status, label, tone, className }) {
  const config = STATUS_MAP[status];
  const resolvedLabel = label ?? config?.label ?? status;
  const resolvedTone = tone ?? config?.tone ?? "neutral";

  return (
    <span className={cx("status-badge", `status-badge--${resolvedTone}`, className)}>
      {resolvedLabel}
    </span>
  );
}
