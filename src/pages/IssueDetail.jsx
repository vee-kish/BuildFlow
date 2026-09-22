import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  History,
  Loader,
  MapPin,
  Play,
  RotateCcw,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { StatusBadge } from "../components/common/StatusBadge";
import { Avatar } from "../components/common/Avatar";
import { Select } from "../components/common/Select";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import {
  issuesService,
  projectsService,
  teamService,
} from "../services/api";
import { ROLES } from "../data/permissions";
import { formatDate, formatRelativeTime, isOverdue } from "../utils/format";
import { cx } from "../utils/cx";
import "./IssueDetail.css";

export default function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const { show } = useToast();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        issuesService.get(issueId),
        teamService.list(),
        projectsService.list({ role: user.role, userId: user.id }),
      ]).then(([issue, users, projects]) => ({ issue, users, projects })),
    [issueId, user.role, user.id]
  );

  const userMap = useMemo(() => {
    const map = {};
    (data?.users ?? []).forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [data?.users]);

  if (loading) {
    return (
      <div className="issue-detail">
        <LoadingState variant="skeleton" rows={8} label="Loading issue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="issue-detail">
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Something went wrong"
            description={error.message}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      </div>
    );
  }

  const issue = data?.issue;

  if (!issue) {
    return (
      <div className="issue-detail">
        <Button variant="ghost" onClick={() => navigate("/issues")}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to issues
        </Button>
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Issue not found"
            description="This issue may have been deleted."
            action={
              <Button variant="primary" onClick={() => navigate("/issues")}>
                View all issues
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const project = (data.projects ?? []).find((p) => p.id === issue.projectId);
  const assignee = userMap[issue.assigneeId];
  const creator = userMap[issue.createdBy];
  const overdue =
    (issue.status === "open" || issue.status === "in-progress") &&
    issue.dueDate &&
    isOverdue(issue.dueDate);

  const canEdit = can("canEditIssue", issue, user.id);
  const canResolve = can("canResolveIssue");
  const canClose = can("canCloseIssue");
  const canDelete = can("canDeleteIssue");
  const assignees = (data.users ?? []).filter((u) => u.role !== ROLES.CLIENT_VIEWER);

  const runStatus = async (status) => {
    setBusy(true);
    try {
      await issuesService.updateStatus(issue.id, { status, byId: user.id });
      show({ type: "success", title: `Issue marked ${status.replace("-", " ")}` });
      reload();
    } catch (err) {
      show({ type: "error", title: "Update failed", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (assigneeId) => {
    setBusy(true);
    try {
      await issuesService.assign(issue.id, {
        assigneeId: assigneeId || null,
        byId: user.id,
      });
      show({ type: "success", title: "Assignee updated" });
      reload();
    } catch (err) {
      show({ type: "error", title: "Could not assign", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await issuesService.comment(issue.id, { body: comment.trim(), authorId: user.id });
      setComment("");
      reload();
    } catch (err) {
      show({ type: "error", title: "Could not add comment", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await issuesService.remove(issue.id, user.id);
      show({ type: "success", title: "Issue deleted" });
      navigate("/issues");
    } catch (err) {
      show({ type: "error", title: "Delete failed", message: err.message });
      setBusy(false);
    }
  };

  return (
    <div className="issue-detail">
      <Button variant="ghost" className="issue-detail__back" onClick={() => navigate("/issues")}>
        <ArrowLeft size={16} aria-hidden="true" />
        All issues
      </Button>

      <header className="issue-detail__header">
        <div className="issue-detail__heading">
          <div className="issue-detail__badges">
            <StatusBadge status={issue.severity} />
            <StatusBadge status={overdue ? "overdue" : issue.status} />
          </div>
          <h1 className="issue-detail__title">{issue.title}</h1>
          <p className="issue-detail__meta">
            <MapPin size={14} aria-hidden="true" />
            {project?.name ?? "—"}
            {issue.location ? ` · ${issue.location}` : ""} · reported by{" "}
            {creator?.name ?? "Unknown"} {formatRelativeTime(issue.createdAt)}
          </p>
        </div>
      </header>

      <div className="issue-detail__grid">
        <div className="issue-detail__main">
          <Card title="Description">
            <p className="issue-detail__description">
              {issue.description || "No description provided."}
            </p>
          </Card>

          {issue.photos?.length > 0 && (
            <Card title={`Photos (${issue.photos.length})`}>
              <ul className="issue-photos">
                {issue.photos.map((p, i) => (
                  <li key={`${p.name}-${i}`} className="issue-photos__item">
                    <Camera size={18} aria-hidden="true" />
                    <span className="issue-photos__name">{p.name}</span>
                    <span className="issue-photos__size">
                      {(p.size / 1_000_000).toFixed(1)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card
            title={`Comments (${issue.comments.length})`}
            className="issue-detail__comments"
          >
            {issue.comments.length === 0 ? (
              <p className="issue-detail__empty">No comments yet.</p>
            ) : (
              <ul className="comment-list">
                {issue.comments.map((c) => {
                  const author = userMap[c.authorId];
                  return (
                    <li key={c.id} className="comment">
                      <Avatar name={author?.name ?? "?"} size="sm" />
                      <div className="comment__body">
                        <p className="comment__head">
                          <strong>{author?.name ?? "Unknown"}</strong>
                          <span className="comment__time">{formatRelativeTime(c.createdAt)}</span>
                        </p>
                        <p className="comment__text">{c.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <form className="comment-form" onSubmit={handleComment}>
              <Avatar name={user.name} size="sm" />
              <div className="comment-form__field">
                <label className="sr-only" htmlFor="comment-input">
                  Add a comment
                </label>
                <textarea
                  id="comment-input"
                  className="input-field__input comment-form__textarea"
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment…"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={!comment.trim() || busy}
                aria-label="Post comment"
              >
                <Send size={16} aria-hidden="true" />
              </Button>
            </form>
          </Card>
        </div>

        <aside className="issue-detail__side">
          <Card title="Details">
            <dl className="issue-facts">
              <div className="issue-facts__row">
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={overdue ? "overdue" : issue.status} />
                </dd>
              </div>
              <div className="issue-facts__row">
                <dt>Severity</dt>
                <dd>
                  <StatusBadge status={issue.severity} />
                </dd>
              </div>
              <div className="issue-facts__row">
                <dt>Due date</dt>
                <dd className={cx(overdue && "issue-facts__overdue")}>
                  {issue.dueDate ? formatDate(issue.dueDate) : "—"}
                </dd>
              </div>
              <div className="issue-facts__row">
                <dt>Project</dt>
                <dd>{project?.name ?? "—"}</dd>
              </div>
            </dl>

            {canEdit ? (
              <div className="issue-detail__assign">
                <Select
                  label="Assigned to"
                  value={issue.assigneeId ?? ""}
                  placeholder="Unassigned"
                  options={assignees.map((u) => ({ value: u.id, label: u.name }))}
                  onChange={(e) => handleAssign(e.target.value)}
                  disabled={busy}
                />
              </div>
            ) : (
              <div className="issue-facts__row issue-detail__assign">
                <dt>Assigned to</dt>
                <dd>{assignee?.name ?? "Unassigned"}</dd>
              </div>
            )}
          </Card>

          {(canEdit || canResolve || canClose || canDelete) && (
            <Card title="Actions">
              <div className="issue-detail__actions">
                {issue.status === "open" && canEdit && (
                  <Button variant="secondary" onClick={() => runStatus("in-progress")} disabled={busy}>
                    <Play size={16} aria-hidden="true" />
                    Start progress
                  </Button>
                )}
                {(issue.status === "open" || issue.status === "in-progress") && canResolve && (
                  <Button variant="primary" onClick={() => runStatus("resolved")} disabled={busy}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Mark resolved
                  </Button>
                )}
                {issue.status === "resolved" && canClose && (
                  <Button variant="primary" onClick={() => runStatus("closed")} disabled={busy}>
                    <XCircle size={16} aria-hidden="true" />
                    Close issue
                  </Button>
                )}
                {(issue.status === "resolved" || issue.status === "closed") && canEdit && (
                  <Button variant="secondary" onClick={() => runStatus("open")} disabled={busy}>
                    <RotateCcw size={16} aria-hidden="true" />
                    Reopen
                  </Button>
                )}
                {canDelete && (
                  <Button variant="danger" onClick={handleDelete} disabled={busy}>
                    <Trash2 size={16} aria-hidden="true" />
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          )}

          <Card title="History">
            {issue.history?.length ? (
              <ol className="issue-history">
                {issue.history.map((h) => {
                  const actor = userMap[h.byId];
                  return (
                    <li key={h.id} className="issue-history__item">
                      <span className="issue-history__icon" aria-hidden="true">
                        <History size={14} />
                      </span>
                      <div className="issue-history__body">
                        <p className="issue-history__detail">{h.detail}</p>
                        <p className="issue-history__meta">
                          {actor?.name ?? "System"} · {formatRelativeTime(h.at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="issue-detail__empty">
                <Loader size={14} aria-hidden="true" /> No history yet.
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
