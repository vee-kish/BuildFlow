import { useMemo, useState } from "react";
import { MoreHorizontal, SearchX, UserPlus, Users } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { SearchInput } from "../components/common/SearchInput";
import { Select } from "../components/common/Select";
import { StatusBadge } from "../components/common/StatusBadge";
import { Avatar } from "../components/common/Avatar";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { Dropdown, DropdownItem } from "../components/common/Dropdown";
import { InviteMemberModal } from "../components/team/InviteMemberModal";
import { ManageMemberModal } from "../components/team/ManageMemberModal";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { projectsService, teamService } from "../services/api";
import { ROLES, ROLE_LABELS } from "../data/permissions";
import "./Team.css";

const ROLE_FILTERS = [
  { value: "all", label: "All roles" },
  ...Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] })),
];

export default function Team() {
  const { user, can } = useAuth();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [manageMember, setManageMember] = useState(null);

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        teamService.list(),
        projectsService.list({ role: user.role, userId: user.id }),
      ]).then(([members, projects]) => ({ members, projects })),
    [user.role, user.id]
  );

  const projectName = useMemo(() => {
    const map = {};
    (data?.projects ?? []).forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [data?.projects]);

  const members = useMemo(() => {
    const list = data?.members ?? [];
    const q = query.trim().toLowerCase();
    return list
      .filter((m) => {
        const matchQ =
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.title ?? "").toLowerCase().includes(q);
        const matchRole = roleFilter === "all" || m.role === roleFilter;
        return matchQ && matchRole;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data?.members, query, roleFilter]);

  const hasFilters = query.trim() !== "" || roleFilter !== "all";

  const rowActions = (member) => (
    <Dropdown
      label={`Actions for ${member.name}`}
      trigger={({ open, menuId }) => (
        <button
          type="button"
          className="team__menu-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`Actions for ${member.name}`}
        >
          <MoreHorizontal size={18} />
        </button>
      )}
    >
      {({ close }) => (
        <DropdownItem
          onSelect={() => {
            setManageMember(member);
            close();
          }}
        >
          Manage access
        </DropdownItem>
      )}
    </Dropdown>
  );

  return (
    <div className="team">
      <PageHeader
        title="Team"
        subtitle={
          loading
            ? "Loading team…"
            : `${data?.members.length ?? 0} people in your firm`
        }
        actions={
          can("canInviteTeamMember") && (
            <Button variant="primary" onClick={() => setInviteOpen(true)}>
              <UserPlus size={16} aria-hidden="true" />
              Invite member
            </Button>
          )
        }
      />

      <div className="team__toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name, email or title…"
          label="Search team"
          className="team__search"
        />
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={ROLE_FILTERS}
          aria-label="Filter by role"
          containerClassName="team__select"
        />
      </div>

      {loading ? (
        <LoadingState variant="skeleton" rows={5} label="Loading team" />
      ) : error ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="Couldn't load team"
            description={error.message}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      ) : members.length === 0 ? (
        <Card>
          <EmptyState
            icon={hasFilters ? SearchX : Users}
            title={hasFilters ? "No members match your filters" : "No team members yet"}
            description={
              hasFilters
                ? "Try adjusting your search or role filter."
                : "Invite your first team member to get started."
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setRoleFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                can("canInviteTeamMember") && (
                  <Button variant="primary" onClick={() => setInviteOpen(true)}>
                    <UserPlus size={16} aria-hidden="true" />
                    Invite member
                  </Button>
                )
              )
            }
          />
        </Card>
      ) : (
        <Card bodyClassName="team__table-wrap">
          <table className="team-table">
            <caption className="sr-only">Team members</caption>
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Role</th>
                <th scope="col">Projects</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="team-table__member">
                      <Avatar name={member.name} size="md" />
                      <div className="team-table__id">
                        <span className="team-table__name">{member.name}</span>
                        <span className="team-table__email">{member.email}</span>
                        {member.title && (
                          <span className="team-table__title">{member.title}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{ROLE_LABELS[member.role]}</td>
                  <td>
                    <div className="team-table__projects">
                      {(member.projectIds ?? []).length === 0 ? (
                        <span className="team-table__none">No access</span>
                      ) : (
                        (member.projectIds ?? []).map((pid) => (
                          <span key={pid} className="team-table__chip">
                            {projectName[pid] ?? pid}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={member.status ?? "active"} />
                  </td>
                  <td className="team-table__actions">
                    {can("canManageTeamMember") && rowActions(member)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projects={data?.projects ?? []}
        currentUserId={user.id}
        onInvited={reload}
      />

      {manageMember && (
        <ManageMemberModal
          open
          onClose={() => setManageMember(null)}
          member={manageMember}
          projects={data?.projects ?? []}
          onSaved={reload}
        />
      )}
    </div>
  );
}
