import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LayoutGrid, List, Plus, SearchX } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { SearchInput } from "../components/common/SearchInput";
import { Select } from "../components/common/Select";
import { ProjectCard } from "../components/common/ProjectCard";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { Card } from "../components/common/Card";
import { CreateProjectModal } from "../components/projects/CreateProjectModal";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { projectsService, teamService } from "../services/api";
import { cx } from "../utils/cx";
import "./Projects.css";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "planning", label: "Planning" },
];

const SORTS = [
  { value: "due", label: "Due soonest" },
  { value: "name", label: "Name (A–Z)" },
  { value: "completion", label: "Most complete" },
  { value: "newest", label: "Newest start" },
];

export default function Projects() {
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const [view, setView] = useLocalStorage("bfk.projectsView", "grid");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        projectsService.list({ role: user.role, userId: user.id }),
        teamService.list(),
      ]).then(([projects, users]) => ({ projects, users })),
    [user.role, user.id]
  );

  const userMap = useMemo(() => {
    const map = {};
    (data?.users ?? []).forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [data?.users]);

  const visibleProjects = useMemo(() => {
    const projects = data?.projects ?? [];
    const q = query.trim().toLowerCase();
    const filtered = projects.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchesStatus = status === "all" || p.status === status;
      return matchesQuery && matchesStatus;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "completion") return b.completion - a.completion;
      if (sort === "newest")
        return new Date(b.startDate ?? 0) - new Date(a.startDate ?? 0);
      return new Date(a.targetDate ?? 0) - new Date(b.targetDate ?? 0);
    });
    return sorted;
  }, [data?.projects, query, status, sort]);

  const total = data?.projects?.length ?? 0;
  const hasFilters = query.trim() !== "" || status !== "all";

  if (error) {
    return (
      <div className="projects">
        <PageHeader title="Projects" />
        <Card>
          <EmptyState
            icon={SearchX}
            title="Couldn't load projects"
            description={error.message}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="projects">
      <PageHeader
        title="Projects"
        subtitle={
          loading
            ? "Loading portfolio…"
            : `${total} project${total === 1 ? "" : "s"} in your portfolio`
        }
        actions={
          can("canCreateProject") && (
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              <Plus size={16} aria-hidden="true" />
              New project
            </Button>
          )
        }
      />

      <div className="projects__toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name, client or location…"
          label="Search projects"
          className="projects__search"
        />
        <div className="projects__controls">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_FILTERS}
            aria-label="Filter by status"
            containerClassName="projects__select"
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={SORTS}
            aria-label="Sort projects"
            containerClassName="projects__select"
          />
          <div className="projects__view-toggle" role="group" aria-label="Layout">
            <button
              type="button"
              className={cx("projects__view-btn", view === "grid" && "projects__view-btn--active")}
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cx("projects__view-btn", view === "list" && "projects__view-btn--active")}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState variant="skeleton" rows={6} label="Loading projects" />
      ) : visibleProjects.length === 0 ? (
        <Card>
          <EmptyState
            icon={hasFilters ? SearchX : Building2}
            title={hasFilters ? "No projects match your filters" : "No projects yet"}
            description={
              hasFilters
                ? "Try adjusting your search or status filter."
                : "Create your first project to start tracking documents, issues and milestones."
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                can("canCreateProject") && (
                  <Button variant="primary" onClick={() => setCreateOpen(true)}>
                    <Plus size={16} aria-hidden="true" />
                    New project
                  </Button>
                )
              )
            }
          />
        </Card>
      ) : (
        <div className={cx("projects__grid", view === "list" && "projects__grid--list")}>
          {visibleProjects.map((project) => {
            const teamNames = (project.team ?? [])
              .map((id) => userMap[id]?.name)
              .filter(Boolean);
            return (
              <ProjectCard
                key={project.id}
                project={project}
                team={teamNames}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            );
          })}
        </div>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        users={data?.users ?? []}
        currentUserId={user.id}
        onCreated={() => {
          reload();
        }}
      />
    </div>
  );
}
