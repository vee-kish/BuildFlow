import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Clock,
  FileCheck2,
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { SummaryCard } from "../components/common/SummaryCard";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";
import { StatusBadge } from "../components/common/StatusBadge";
import { QuickActions } from "../components/dashboard/QuickActions";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { DeadlineList } from "../components/dashboard/DeadlineList";
import { NeedsAttention } from "../components/dashboard/NeedsAttention";
import { TaskList } from "../components/dashboard/TaskList";
import { DocumentReviewList } from "../components/dashboard/DocumentReviewList";
import { MilestoneTimeline } from "../components/dashboard/MilestoneTimeline";
import { SiteUpdates } from "../components/dashboard/SiteUpdates";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ROLES, canViewDocument } from "../data/permissions";
import { getProjectById } from "../data/mockData";
import {
  activityService,
  deadlinesService,
  documentsService,
  issuesService,
  projectsService,
} from "../services/api";
import { formatDate, greetingForDate } from "../utils/format";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    projects: [],
    issues: [],
    documents: [],
    activities: [],
    deadlines: [],
    siteUpdates: [],
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      projectsService.list(),
      issuesService.list(),
      documentsService.list(),
      activityService.list(),
      deadlinesService.list(),
      activityService.siteUpdates(),
    ]).then(([projects, issues, documents, activities, deadlines, siteUpdates]) => {
      if (!cancelled) {
        setData({ projects, issues, documents, activities, deadlines, siteUpdates });
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = useMemo(() => greetingForDate(), []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const role = user.role;

  return (
    <div className="dashboard">
      <header className="dash-greeting">
        <h1 className="dash-greeting__title">
          {greeting}, {user.name.split(" ")[0]}
        </h1>
        <p className="dash-greeting__subtitle">
          Here's what's happening across your projects today.
        </p>
      </header>

      {role === ROLES.ADMIN || role === ROLES.PROJECT_MANAGER ? (
        <ManagerDashboard data={data} />
      ) : role === ROLES.CONSULTANT ? (
        <ConsultantDashboard data={data} user={user} onNotify={show} />
      ) : role === ROLES.SITE_TEAM ? (
        <SiteTeamDashboard data={data} user={user} onNotify={show} />
      ) : (
        <ClientDashboard data={data} user={user} />
      )}
    </div>
  );
}

function ManagerDashboard({ data }) {
  const navigate = useNavigate();
  const { projects, issues, documents, activities, deadlines } = data;

  const activeProjects = projects.filter((p) => p.status === "active");
  const openIssues = issues.filter((i) => i.status !== "resolved");
  const overdueItems = issues.filter((i) => i.overdue);
  const docsAwaiting = documents.filter((d) => d.status === "awaiting-review");

  return (
    <>
      <div className="dash-summary-grid">
        <SummaryCard
          icon={Building2}
          tone="accent"
          value={activeProjects.length}
          label="Active Projects"
          footnote={`${projects.length} total in portfolio`}
          onClick={() => navigate("/projects")}
        />
        <SummaryCard
          icon={AlertTriangle}
          tone="info"
          value={openIssues.length}
          label="Open Issues"
          footnote={`${issues.filter((i) => i.severity === "high").length} high severity`}
          onClick={() => navigate("/issues")}
        />
        <SummaryCard
          icon={Clock}
          tone="danger"
          value={overdueItems.length}
          label="Overdue Items"
          onClick={() => navigate("/issues")}
        />
        <SummaryCard
          icon={FileCheck2}
          tone="warning"
          value={docsAwaiting.length}
          label="Documents Awaiting Review"
          onClick={() => navigate("/documents")}
        />
      </div>

      <Card title="Quick actions" className="dash-grid__full" bodyClassName="quick-actions-body">
        <QuickActions
          actions={["new-project", "upload-document", "create-issue", "invite-member"]}
        />
      </Card>

      <div className="dash-grid" style={{ marginTop: "var(--space-16)" }}>
        <Card title="Needs attention" subtitle="Overdue, high severity, and pending reviews">
          <NeedsAttention issues={issues} documents={documents} />
        </Card>
        <Card title="Upcoming deadlines">
          <DeadlineList deadlines={deadlines} />
        </Card>
        <Card title="Recent activity" className="dash-grid__full">
          <ActivityFeed activities={activities} />
        </Card>
      </div>
    </>
  );
}

function ConsultantDashboard({ data, user, onNotify }) {
  const navigate = useNavigate();
  const { documents, issues } = data;

  const visibleDocs = documents.filter((d) => canViewDocument(user.role, d));
  const awaitingReview = visibleDocs.filter((d) => d.status === "awaiting-review");
  const assignedIssues = issues.filter(
    (i) => i.assigneeId === user.id || i.createdBy === user.id
  );
  const recentDrawings = visibleDocs
    .filter((d) => d.category === "Drawings")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  const handleReview = (doc) => {
    onNotify({
      type: "info",
      title: "Document review",
      message: `Review flow for "${doc.title}" arrives in a later phase.`,
    });
  };

  return (
    <>
      <div className="dash-summary-grid">
        <SummaryCard
          icon={FileCheck2}
          tone="warning"
          value={awaitingReview.length}
          label="Documents Awaiting Review"
          onClick={() => navigate("/documents")}
        />
        <SummaryCard
          icon={AlertTriangle}
          tone="info"
          value={assignedIssues.filter((i) => i.status !== "resolved").length}
          label="Assigned RFIs / Issues"
          onClick={() => navigate("/issues")}
        />
      </div>

      <Card title="Quick actions">
        <QuickActions actions={["upload-document", "create-issue"]} />
      </Card>

      <div className="dash-grid" style={{ marginTop: "var(--space-16)" }}>
        <Card title="Documents awaiting review">
          <DocumentReviewList documents={awaitingReview} onAction={handleReview} />
        </Card>
        <Card title="Recently updated drawings">
          <DocumentReviewList
            documents={recentDrawings}
            emptyMessage="No drawing updates."
          />
        </Card>
        <Card title="Assigned RFIs and issues" className="dash-grid__full">
          <TaskList tasks={assignedIssues} emptyMessage="No issues assigned to you." />
        </Card>
      </div>
    </>
  );
}

function SiteTeamDashboard({ data, user, onNotify }) {
  const navigate = useNavigate();
  const { issues, siteUpdates } = data;

  const myTasks = issues.filter((i) => i.assigneeId === user.id);
  const overdueTasks = myTasks.filter((i) => i.overdue);

  return (
    <>
      <div className="dash-summary-grid">
        <SummaryCard
          icon={AlertTriangle}
          tone="info"
          value={myTasks.filter((i) => i.status !== "resolved").length}
          label="My Assigned Tasks"
          onClick={() => navigate("/issues")}
        />
        <SummaryCard
          icon={Clock}
          tone="danger"
          value={overdueTasks.length}
          label="Overdue Tasks"
          onClick={() => navigate("/issues")}
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        className="dash-report-issue"
        onClick={() =>
          onNotify({
            type: "info",
            title: "Report Site Issue",
            message: "Issue reporting form arrives in a later phase.",
          })
        }
      >
        <AlertTriangle size={20} aria-hidden="true" />
        Report Site Issue
      </Button>

      <div className="dash-grid" style={{ marginTop: "var(--space-16)" }}>
        <Card title="Quick actions">
          <QuickActions actions={["add-photos", "create-issue"]} />
        </Card>
        <Card title="Recent site updates">
          <SiteUpdates updates={siteUpdates} />
        </Card>
        <Card title="My tasks and issues" className="dash-grid__full">
          <TaskList tasks={myTasks} emptyMessage="No tasks assigned to you." />
        </Card>
      </div>
    </>
  );
}

function ClientDashboard({ data, user }) {
  const { documents, activities } = data;

  // Demo: this client viewer is tied to the Riverside Office Fit-Out project
  const project = getProjectById("p-riverside");

  const visibleDocs = documents.filter(
    (d) => canViewDocument(user.role, d) && d.projectId === project.id
  );
  const pendingApprovals = visibleDocs.filter((d) => d.status === "awaiting-review");
  const approvedDocs = visibleDocs
    .filter((d) => d.status === "approved")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const projectActivity = activities.filter((a) => a.projectId === project.id);

  return (
    <>
      <Card
        title={project.name}
        action={<StatusBadge status={project.status} />}
        subtitle={`${project.location} · Target completion ${formatDate(project.targetDate)}`}
      >
        <div className="client-progress">
          <div className="client-progress__head">
            <span className="client-progress__label">Overall progress</span>
            <span className="client-progress__value">{project.completion}%</span>
          </div>
          <div
            className="client-progress__bar"
            role="progressbar"
            aria-valuenow={project.completion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${project.name} progress`}
          >
            <div
              className="client-progress__fill"
              style={{ width: `${project.completion}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="dash-grid" style={{ marginTop: "var(--space-16)" }}>
        <Card title="Milestones">
          <MilestoneTimeline milestones={project.milestones} />
        </Card>
        <div className="dash-stack">
          <Card title="Pending approvals">
            <DocumentReviewList
              documents={pendingApprovals}
              emptyMessage="Nothing is waiting on you."
            />
          </Card>
          <Card title="Latest approved documents" style={{ marginTop: "var(--space-16)" }}>
            <DocumentReviewList
              documents={approvedDocs}
              emptyMessage="No approved documents shared yet."
            />
          </Card>
        </div>
        <Card title="Project updates" subtitle="Read-only feed" className="dash-grid__full">
          <ActivityFeed activities={projectActivity} emptyMessage="No updates yet." />
        </Card>
      </div>

      <p className="dash-client-note">
        <CalendarClock size={14} aria-hidden="true" />
        You have read-only access. Contact your project team for changes.
      </p>
    </>
  );
}
