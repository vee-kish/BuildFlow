import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarClock,
  FileText,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { StatusBadge } from "../components/common/StatusBadge";
import { Avatar } from "../components/common/Avatar";
import { Tabs, TabPanel } from "../components/common/Tabs";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { MilestoneTimeline } from "../components/dashboard/MilestoneTimeline";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { AssignTeamModal } from "../components/projects/AssignTeamModal";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import {
  activityService,
  deadlinesService,
  documentsService,
  issuesService,
  projectsService,
  teamService,
} from "../services/api";
import { ROLE_LABELS } from "../data/permissions";
import { formatCurrencyKES, formatDate } from "../utils/format";
import { cx } from "../utils/cx";
import "./ProjectDetail.css";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const [tab, setTab] = useState("overview");
  const [assignOpen, setAssignOpen] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        projectsService.get(projectId),
        teamService.list(),
        documentsService.list({ role: user.role, userId: user.id, projectId }),
        issuesService.list({ role: user.role, userId: user.id, projectId }),
        activityService.list({ role: user.role, userId: user.id, projectId }),
        deadlinesService.list({ projectId }),
      ]).then(([project, users, documents, issues, activities, deadlines]) => ({
        project,
        users,
        documents,
        issues,
        activities,
        deadlines,
      })),
    [projectId, user.role, user.id]
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
      <div className="project-detail">
        <LoadingState variant="skeleton" rows={8} label="Loading project" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-detail">
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

  const project = data?.project;

  if (!project) {
    return (
      <div className="project-detail">
        <Button variant="ghost" onClick={() => navigate("/projects")}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to projects
        </Button>
        <Card>
          <EmptyState
            icon={Building2}
            title="Project not found"
            description="This project may have been deleted, or you don't have access to it."
            action={
              <Button variant="primary" onClick={() => navigate("/projects")}>
                View all projects
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const teamMembers = (project.team ?? [])
    .map((id) => userMap[id])
    .filter(Boolean);
  const manager = userMap[project.managerId];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "documents", label: "Documents", count: data.documents.length },
    can("canViewIssues") && { id: "issues", label: "Issues", count: data.issues.length },
    { id: "team", label: "Team", count: teamMembers.length },
    can("canViewActivity") && { id: "activity", label: "Activity" },
  ].filter(Boolean);

  return (
    <div className="project-detail">
      <Button variant="ghost" className="project-detail__back" onClick={() => navigate("/projects")}>
        <ArrowLeft size={16} aria-hidden="true" />
        All projects
      </Button>

      <header className="project-detail__header">
        <div className="project-detail__heading">
          <div className="project-detail__title-row">
            <h1 className="project-detail__title">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="project-detail__meta">
            <MapPin size={14} aria-hidden="true" />
            {project.location} · {project.client}
          </p>
        </div>
        {can("canEditProject") && (
          <Button variant="secondary" onClick={() => setAssignOpen(true)}>
            <Users size={16} aria-hidden="true" />
            Assign team
          </Button>
        )}
      </header>

      <div className="project-detail__progress">
        <div className="project-detail__progress-head">
          <span>Overall completion</span>
          <strong>{project.completion}%</strong>
        </div>
        <div
          className="project-detail__bar"
          role="progressbar"
          aria-valuenow={project.completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${project.name} completion`}
        >
          <div className="project-detail__bar-fill" style={{ width: `${project.completion}%` }} />
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} ariaLabel="Project sections" />

      {tab === "overview" && (
        <TabPanel id="overview">
          <div className="project-detail__facts">
            <Fact icon={CalendarClock} label="Start date" value={formatDate(project.startDate)} />
            <Fact icon={CalendarClock} label="Target completion" value={formatDate(project.targetDate)} />
            <Fact icon={Wallet} label="Budget" value={project.budgetKES ? formatCurrencyKES(project.budgetKES) : "—"} />
            <Fact icon={Users} label="Project manager" value={manager?.name ?? "Unassigned"} />
          </div>

          <div className="project-detail__cols">
            <Card title="About this project">
              <p className="project-detail__description">
                {project.description || "No description provided."}
              </p>
            </Card>
            <Card title="Milestones">
              <MilestoneTimeline milestones={project.milestones} />
            </Card>
          </div>

          {data.deadlines.length > 0 && (
            <Card title="Upcoming deadlines" className="project-detail__deadlines">
              <ul className="pd-deadline-list">
                {data.deadlines.map((d) => (
                  <li key={d.id} className="pd-deadline">
                    <span className="pd-deadline__title">{d.title}</span>
                    <StatusBadge
                      status={d.type}
                      label={d.type}
                      tone="neutral"
                    />
                    <span className="pd-deadline__date">{formatDate(d.date)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabPanel>
      )}

      {tab === "documents" && (
        <TabPanel id="documents">
          <Card
            title="Documents"
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate("/documents")}>
                Open document centre
              </Button>
            }
          >
            {data.documents.length === 0 ? (
              <EmptyState icon={FileText} title="No documents" description="Nothing has been uploaded to this project yet." />
            ) : (
              <ul className="pd-list">
                {data.documents.map((doc) => (
                  <li key={doc.id} className="pd-list__item">
                    <FileText size={18} aria-hidden="true" className="pd-list__icon" />
                    <div className="pd-list__body">
                      <p className="pd-list__title">{doc.title}</p>
                      <p className="pd-list__meta">
                        {doc.category} · v{doc.version} · {formatDate(doc.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabPanel>
      )}

      {tab === "issues" && can("canViewIssues") && (
        <TabPanel id="issues">
          <Card
            title="Issues"
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate("/issues")}>
                Open issue tracker
              </Button>
            }
          >
            {data.issues.length === 0 ? (
              <EmptyState icon={AlertTriangle} title="No issues" description="No issues reported on this project." />
            ) : (
              <ul className="pd-list">
                {data.issues.map((issue) => (
                  <li key={issue.id}>
                    <button
                      type="button"
                      className="pd-list__item pd-list__item--link"
                      onClick={() => navigate(`/issues/${issue.id}`)}
                    >
                      <AlertTriangle size={18} aria-hidden="true" className="pd-list__icon" />
                      <div className="pd-list__body">
                        <p className="pd-list__title">{issue.title}</p>
                        <p className="pd-list__meta">
                          {issue.severity} severity
                          {issue.dueDate ? ` · due ${formatDate(issue.dueDate)}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={issue.overdue && issue.status !== "resolved" ? "overdue" : issue.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabPanel>
      )}

      {tab === "team" && (
        <TabPanel id="team">
          <Card
            title="Project team"
            action={
              can("canEditProject") && (
                <Button variant="secondary" size="sm" onClick={() => setAssignOpen(true)}>
                  <Users size={14} aria-hidden="true" />
                  Assign team
                </Button>
              )
            }
          >
            {teamMembers.length === 0 ? (
              <EmptyState icon={Users} title="No team assigned" description="Assign team members to this project." />
            ) : (
              <ul className="pd-team">
                {teamMembers.map((m) => (
                  <li key={m.id} className="pd-team__member">
                    <Avatar name={m.name} size="md" />
                    <div className="pd-team__info">
                      <span className="pd-team__name">{m.name}</span>
                      <span className="pd-team__role">
                        {ROLE_LABELS[m.role]}
                        {m.id === project.managerId ? " · Manager" : ""}
                      </span>
                    </div>
                    <StatusBadge status={m.status ?? "active"} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabPanel>
      )}

      {tab === "activity" && can("canViewActivity") && (
        <TabPanel id="activity">
          <Card title="Project activity">
            <ActivityFeed activities={data.activities} emptyMessage="No activity recorded yet." />
          </Card>
        </TabPanel>
      )}

      {assignOpen && (
        <AssignTeamModal
          open
          onClose={() => setAssignOpen(false)}
          project={project}
          users={data.users}
          onSaved={reload}
        />
      )}
    </div>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="pd-fact">
      <span className={cx("pd-fact__icon")} aria-hidden="true">
        <Icon size={16} />
      </span>
      <div>
        <p className="pd-fact__label">{label}</p>
        <p className="pd-fact__value">{value}</p>
      </div>
    </div>
  );
}
