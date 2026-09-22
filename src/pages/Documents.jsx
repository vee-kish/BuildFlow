import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  History,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  SearchX,
  Table as TableIcon,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { SearchInput } from "../components/common/SearchInput";
import { Select } from "../components/common/Select";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "../components/common/Dropdown";
import { UploadDocumentModal } from "../components/documents/UploadDocumentModal";
import { ReviewDocumentModal } from "../components/documents/ReviewDocumentModal";
import { DocumentVersionsModal } from "../components/documents/DocumentVersionsModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  documentsService,
  projectsService,
  teamService,
} from "../services/api";
import { formatDate } from "../utils/format";
import { cx } from "../utils/cx";
import "./Documents.css";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "awaiting-review", label: "Awaiting review" },
  { value: "approved", label: "Approved" },
  { value: "changes-requested", label: "Changes requested" },
  { value: "draft", label: "Draft" },
];

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export default function Documents() {
  const { user, can } = useAuth();
  const { show } = useToast();
  const [layout, setLayout] = useLocalStorage("bfk.docsLayout", "table");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reviewDoc, setReviewDoc] = useState(null);
  const [versionsDoc, setVersionsDoc] = useState(null);

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        documentsService.list({ role: user.role, userId: user.id }),
        projectsService.list({ role: user.role, userId: user.id }),
        teamService.list(),
      ]).then(([documents, projects, users]) => ({ documents, projects, users })),
    [user.role, user.id]
  );

  const projectName = useMemo(() => {
    const map = {};
    (data?.projects ?? []).forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [data?.projects]);

  const visibleDocs = useMemo(() => {
    const docs = data?.documents ?? [];
    const q = query.trim().toLowerCase();
    return docs
      .filter((d) => {
        const matchQ =
          !q ||
          d.title.toLowerCase().includes(q) ||
          (projectName[d.projectId] ?? "").toLowerCase().includes(q);
        const matchCat = category === "all" || d.category === category;
        const matchStatus = status === "all" || d.status === status;
        const matchProject = projectFilter === "all" || d.projectId === projectFilter;
        return matchQ && matchCat && matchStatus && matchProject;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [data?.documents, query, category, status, projectFilter, projectName]);

  const categories = useMemo(() => {
    const set = new Set((data?.documents ?? []).map((d) => d.category));
    return [{ value: "all", label: "All categories" }, ...[...set].map((c) => ({ value: c, label: c }))];
  }, [data?.documents]);

  const projectOptions = useMemo(
    () => [
      { value: "all", label: "All projects" },
      ...(data?.projects ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [data?.projects]
  );

  const handleDelete = async (doc) => {
    try {
      await documentsService.remove(doc.id, user.id);
      show({ type: "success", title: "Document deleted", message: doc.title });
      reload();
    } catch (err) {
      show({ type: "error", title: "Delete failed", message: err.message });
    }
  };

  const handleDownload = (doc) => {
    show({
      type: "info",
      title: "Download unavailable",
      message: `${doc.title} is a demo record with no real file attached.`,
    });
  };

  const rowActions = (doc) => (
    <Dropdown
      label={`Actions for ${doc.title}`}
      trigger={({ open, menuId }) => (
        <button
          type="button"
          className="docs__menu-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`Actions for ${doc.title}`}
        >
          <MoreHorizontal size={18} />
        </button>
      )}
    >
      {({ close }) => (
        <>
          <DropdownItem
            icon={History}
            onSelect={() => {
              setVersionsDoc(doc);
              close();
            }}
          >
            Version history
          </DropdownItem>
          {can("canApproveDocument") && doc.status !== "approved" && (
            <DropdownItem
              icon={CheckCircle2}
              onSelect={() => {
                setReviewDoc(doc);
                close();
              }}
            >
              Review
            </DropdownItem>
          )}
          <DropdownItem icon={Download} onSelect={() => { handleDownload(doc); close(); }}>
            Download
          </DropdownItem>
          {can("canDeleteDocument") && (
            <>
              <DropdownDivider />
              <DropdownItem
                icon={Trash2}
                danger
                onSelect={() => { handleDelete(doc); close(); }}
              >
                Delete
              </DropdownItem>
            </>
          )}
        </>
      )}
    </Dropdown>
  );

  const hasFilters = query.trim() !== "" || category !== "all" || status !== "all" || projectFilter !== "all";

  return (
    <div className="documents">
      <PageHeader
        title="Documents"
        subtitle={
          loading
            ? "Loading document centre…"
            : `${data?.documents.length ?? 0} documents visible to you`
        }
        actions={
          can("canCreateDocument") && (
            <Button variant="primary" onClick={() => setUploadOpen(true)}>
              <Plus size={16} aria-hidden="true" />
              Upload document
            </Button>
          )
        }
      />

      <div className="documents__toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search documents…"
          label="Search documents"
          className="documents__search"
        />
        <div className="documents__controls">
          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={projectOptions}
            aria-label="Filter by project"
            containerClassName="documents__select"
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categories}
            aria-label="Filter by category"
            containerClassName="documents__select"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_FILTERS}
            aria-label="Filter by status"
            containerClassName="documents__select"
          />
          <div className="documents__view-toggle" role="group" aria-label="Layout">
            <button
              type="button"
              className={cx("documents__view-btn", layout === "table" && "documents__view-btn--active")}
              onClick={() => setLayout("table")}
              aria-pressed={layout === "table"}
              aria-label="Table layout"
            >
              <TableIcon size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cx("documents__view-btn", layout === "cards" && "documents__view-btn--active")}
              onClick={() => setLayout("cards")}
              aria-pressed={layout === "cards"}
              aria-label="Card layout"
            >
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState variant="skeleton" rows={6} label="Loading documents" />
      ) : error ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="Couldn't load documents"
            description={error.message}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      ) : visibleDocs.length === 0 ? (
        <Card>
          <EmptyState
            icon={hasFilters ? SearchX : FileText}
            title={hasFilters ? "No documents match your filters" : "No documents yet"}
            description={
              hasFilters
                ? "Try adjusting your search or filters."
                : "Upload the first document for your projects."
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                    setStatus("all");
                    setProjectFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                can("canCreateDocument") && (
                  <Button variant="primary" onClick={() => setUploadOpen(true)}>
                    <Plus size={16} aria-hidden="true" />
                    Upload document
                  </Button>
                )
              )
            }
          />
        </Card>
      ) : layout === "table" ? (
        <Card bodyClassName="documents__table-wrap">
          <table className="docs-table">
            <caption className="sr-only">Project documents</caption>
            <thead>
              <tr>
                <th scope="col">Document</th>
                <th scope="col">Project</th>
                <th scope="col">Category</th>
                <th scope="col">Version</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="docs-table__title">
                      <FileText size={16} aria-hidden="true" />
                      <span>{doc.title}</span>
                    </div>
                  </td>
                  <td>{projectName[doc.projectId] ?? "—"}</td>
                  <td>{doc.category}</td>
                  <td>v{doc.version}</td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td>{formatDate(doc.updatedAt)}</td>
                  <td className="docs-table__actions">{rowActions(doc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="documents__cards">
          {visibleDocs.map((doc) => (
            <Card key={doc.id} className="doc-card">
              <div className="doc-card__top">
                <div className="docs-table__title">
                  <FileText size={18} aria-hidden="true" />
                  <span className="doc-card__title">{doc.title}</span>
                </div>
                {rowActions(doc)}
              </div>
              <p className="doc-card__meta">
                {projectName[doc.projectId] ?? "—"} · {doc.category} ·{" "}
                {formatFileSize(doc.fileSize)}
              </p>
              <div className="doc-card__footer">
                <StatusBadge status={doc.status} />
                <span className="doc-card__version">v{doc.version}</span>
                <span className="doc-card__updated">{formatDate(doc.updatedAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        projects={data?.projects ?? []}
        currentUserId={user.id}
        currentUserRole={user.role}
        onUploaded={reload}
      />

      {reviewDoc && (
        <ReviewDocumentModal
          open
          onClose={() => setReviewDoc(null)}
          document={reviewDoc}
          currentUserId={user.id}
          onReviewed={reload}
        />
      )}

      {versionsDoc && (
        <DocumentVersionsModal
          open
          onClose={() => setVersionsDoc(null)}
          document={versionsDoc}
          users={data?.users ?? []}
          currentUserId={user.id}
          canUpload={can("canCreateDocument")}
          onUpdated={reload}
        />
      )}
    </div>
  );
}
