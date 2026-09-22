import { useMemo, useState } from "react";
import { Activity as ActivityIcon, Download, SearchX } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Select } from "../components/common/Select";
import { SearchInput } from "../components/common/SearchInput";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import { activityService, projectsService } from "../services/api";
import { getProjectById, getUserById } from "../data/mockData";
import "./Activity.css";

function toCsv(rows) {
  const header = ["Timestamp", "User", "Action", "Target", "Project"];
  const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.timestamp,
      getUserById(r.userId)?.name ?? r.userId,
      r.action,
      r.target,
      getProjectById(r.projectId)?.name ?? "",
    ]
      .map(escape)
      .join(",")
  );
  return [header.map(escape).join(","), ...lines].join("\n");
}

export default function Activity() {
  const { user, can } = useAuth();
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        activityService.list({ role: user.role, userId: user.id }),
        projectsService.list({ role: user.role, userId: user.id }),
      ]).then(([activities, projects]) => ({ activities, projects })),
    [user.role, user.id]
  );

  const projectOptions = useMemo(
    () => [
      { value: "all", label: "All projects" },
      ...(data?.projects ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [data?.projects]
  );

  const actionOptions = useMemo(() => {
    const set = new Set((data?.activities ?? []).map((a) => a.action));
    return [
      { value: "all", label: "All actions" },
      ...[...set].sort().map((a) => ({ value: a, label: a })),
    ];
  }, [data?.activities]);

  const filtered = useMemo(() => {
    const list = data?.activities ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((a) => {
      const matchQ =
        !q ||
        a.target.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        (getUserById(a.userId)?.name ?? "").toLowerCase().includes(q);
      const matchProject = projectFilter === "all" || a.projectId === projectFilter;
      const matchAction = actionFilter === "all" || a.action === actionFilter;
      return matchQ && matchProject && matchAction;
    });
  }, [data?.activities, query, projectFilter, actionFilter]);

  const handleExport = () => {
    if (filtered.length === 0) {
      show({ type: "info", title: "Nothing to export", message: "No activity matches your filters." });
      return;
    }
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `buildflow-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    show({ type: "success", title: "Export started", message: `${filtered.length} activity records.` });
  };

  const hasFilters = query.trim() !== "" || projectFilter !== "all" || actionFilter !== "all";

  return (
    <div className="activity">
      <PageHeader
        title="Activity"
        subtitle={
          loading
            ? "Loading activity…"
            : `${filtered.length} event${filtered.length === 1 ? "" : "s"} across your projects`
        }
        actions={
          can("canExportData") && (
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} aria-hidden="true" />
              Export CSV
            </Button>
          )
        }
      />

      <div className="activity__toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search activity…"
          label="Search activity"
          className="activity__search"
        />
        <div className="activity__controls">
          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={projectOptions}
            aria-label="Filter by project"
            containerClassName="activity__select"
          />
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            options={actionOptions}
            aria-label="Filter by action"
            containerClassName="activity__select"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState variant="skeleton" rows={6} label="Loading activity" />
      ) : error ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="Couldn't load activity"
            description={error.message}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      ) : (
        <Card title="Activity feed">
          {filtered.length === 0 ? (
            <EmptyState
              icon={hasFilters ? SearchX : ActivityIcon}
              title={hasFilters ? "No activity matches your filters" : "No activity yet"}
              description={
                hasFilters
                  ? "Try adjusting your search or filters."
                  : "Actions across your projects will appear here."
              }
              action={
                hasFilters && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setProjectFilter("all");
                      setActionFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <ActivityFeed activities={filtered} />
          )}
        </Card>
      )}
    </div>
  );
}
