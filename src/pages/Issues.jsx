import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Camera,
  Plus,
  SearchX,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { SearchInput } from "../components/common/SearchInput";
import { Select } from "../components/common/Select";
import { StatusBadge } from "../components/common/StatusBadge";
import { Avatar } from "../components/common/Avatar";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { IssueFormModal } from "../components/issues/IssueFormModal";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import {
  issuesService,
  projectsService,
  teamService,
} from "../services/api";
import { ROLES } from "../data/permissions";
import { formatDate, isOverdue } from "../utils/format";
import { cx } from "../utils/cx";
import "./Issues.css";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "overdue", label: "Overdue" },
];

const SEVERITY_FILTERS = [
  { value: "all", label: "All severities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function issueIsOverdue(issue) {
  const closed = issue.status === "resolved" || issue.status === "closed";
  return !closed && Boolean(issue.dueDate) && isOverdue(issue.dueDate);
}

export default function Issues() {
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [modalVariant, setModalVariant] = useState(null); // null | 'standard' | 'site'

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        issuesService.list({ role: user.role, userId: user.id }),
        projectsService.list({ role: user.role, userId: user.id }),
        teamService.list(),
      ]).then(([issues, projects, users]) => ({ issues, projects, users })),
    [user.role, user.id]
  );

  const projectName = useMemo(() => {
    const map = {};
    (data?.projects ?? []).forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [data?.projects]);

  const userMap = useMemo(() => {
    const map = {};
    (data?.users ?? []).forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [data?.users]);

  const visibleIssues = useMemo(() => {
    const issues = data?.issues ?? [];
    const q = query.trim().toLowerCase();
    return issues
      .filter((i) => {
        const matchQ =
          !q ||
          i.title.toLowerCase().includes(q) ||
          (projectName[i.projectId] ?? "").toLowerCase().includes(q);
        const matchSev = severity === "all" || i.severity === severity;
        const matchProject = projectFilter === "all" || i.projectId === projectFilter;
        let matchStatus = true;
        if (status === "overdue") matchStatus = issueIsOverdue(i);
        else if (status !== "all") matchStatus = i.status === status;
        return matchQ && matchSev && matchProject && matchStatus;
      })
      .sort((a, b) => {
        const aOver = issueIsOverdue(a) ? 0 : 1;
        const bOver = issueIsOverdue(b) ? 0 : 1;
        if (aOver !== bOver) return aOver - bOver;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [data?.issues, query, severity, projectFilter, status, projectName]);

  const projectOptions = useMemo(
    () => [
      { value: "all", label: "All projects" },
      ...(data?.projects ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [data?.projects]
  );

  const hasFilters =
    query.trim() !== "" || status !== "all" || severity !== "all" || projectFilter !== "all";
  const isSiteRole = user.role === ROLES.SITE_TEAM;

  const openCount = (data?.issues ?? []).filter(
    (i) => i.status !== "resolved" && i.status !== "closed"
  ).length;

  return (
    <div className="issues">
      <PageHeader
        title="Issues"
        subtitle={
          loading ? "Loading issue tracker…" : `${openCount} open of ${data?.issues.length ?? 0} total`
        }
        actions={
          can("canCreateIssue") && (
            <div className="issues__actions">
              <Button variant="secondary" onClick={() => setModalVariant("site")}>
                <Camera size={16} aria-hidden="true" />
                Report site issue
              </Button>
              <Button variant="primary" onClick={() => setModalVariant("standard")}>
                <Plus size={16} aria-hidden="true" />
                New issue
              </Button>
            </div>
          )
        }
      />

      <div className="issues__toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search issues…"
          label="Search issues"
          className="issues__search"
        />
        <div className="issues__controls">
          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={projectOptions}
            aria-label="Filter by project"
            containerClassName="issues__select"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_FILTERS}
            aria-label="Filter by status"
            containerClassName="issues__select"
          />
          <Select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            options={SEVERITY_FILTERS}
            aria-label="Filter by severity"
            containerClassName="issues__select"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState variant="skeleton" rows={6} label="Loading issues" />
      ) : error ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="Couldn't load issues"
            description={error.message}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      ) : visibleIssues.length === 0 ? (
        <Card>
          <EmptyState
            icon={hasFilters ? SearchX : AlertTriangle}
            title={hasFilters ? "No issues match your filters" : "No issues reported"}
            description={
              hasFilters
                ? "Try adjusting your search or filters."
                : "Report the first issue to start tracking site problems."
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setSeverity("all");
                    setProjectFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                can("canCreateIssue") && (
                  <Button variant="primary" onClick={() => setModalVariant(isSiteRole ? "site" : "standard")}>
                    <Plus size={16} aria-hidden="true" />
                    New issue
                  </Button>
                )
              )
            }
          />
        </Card>
      ) : (
        <ul className="issue-list">
          {visibleIssues.map((issue) => {
            const overdue = issueIsOverdue(issue);
            const assignee = userMap[issue.assigneeId];
            return (
              <li key={issue.id}>
                <button
                  type="button"
                  className={cx("issue-row", overdue && "issue-row--overdue")}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                >
                  <span className={cx("issue-row__sev", `issue-row__sev--${issue.severity}`)} aria-hidden="true" />
                  <span className="issue-row__main">
                    <span className="issue-row__title">{issue.title}</span>
                    <span className="issue-row__meta">
                      {projectName[issue.projectId] ?? "—"}
                      {issue.location ? ` · ${issue.location}` : ""}
                      {issue.dueDate ? ` · due ${formatDate(issue.dueDate)}` : ""}
                      {issue.photos?.length > 0 ? ` · ${issue.photos.length} photo${issue.photos.length === 1 ? "" : "s"}` : ""}
                    </span>
                  </span>
                  <span className="issue-row__assignee">
                    {assignee ? (
                      <>
                        <Avatar name={assignee.name} size="sm" />
                        <span className="sr-only">Assigned to {assignee.name}</span>
                      </>
                    ) : (
                      <span className="issue-row__unassigned">Unassigned</span>
                    )}
                  </span>
                  <StatusBadge status={overdue ? "overdue" : issue.status} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {modalVariant && (
        <IssueFormModal
          open
          variant={modalVariant}
          onClose={() => setModalVariant(null)}
          projects={data?.projects ?? []}
          users={data?.users ?? []}
          currentUserId={user.id}
          onCreated={reload}
        />
      )}
    </div>
  );
}
