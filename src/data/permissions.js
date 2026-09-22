/* BuildFlow Kenya - Permissions system
   Defines what each role can see and do.
   Backend integration note: permissions will eventually be enforced server-side.
*/

export const ROLES = {
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  CONSULTANT: "consultant",
  SITE_TEAM: "site_team",
  CLIENT_VIEWER: "client_viewer",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.PROJECT_MANAGER]: "Project Manager",
  [ROLES.CONSULTANT]: "Consultant",
  [ROLES.SITE_TEAM]: "Site Team",
  [ROLES.CLIENT_VIEWER]: "Client Viewer",
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: "Full firm and project access",
  [ROLES.PROJECT_MANAGER]: "Manages assigned projects and team",
  [ROLES.CONSULTANT]: "Reviews and uploads technical documents",
  [ROLES.SITE_TEAM]: "Creates issues and updates tasks on site",
  [ROLES.CLIENT_VIEWER]: "Read-only access to selected items",
};

// Navigation items visible to each role
export const NAV_ITEMS = {
  dashboard: {
    path: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.CONSULTANT,
      ROLES.SITE_TEAM,
      ROLES.CLIENT_VIEWER,
    ],
  },
  projects: {
    path: "/projects",
    label: "Projects",
    icon: "Building2",
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.CONSULTANT,
      ROLES.SITE_TEAM,
      ROLES.CLIENT_VIEWER,
    ],
  },
  documents: {
    path: "/documents",
    label: "Documents",
    icon: "FileText",
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.CONSULTANT,
      ROLES.SITE_TEAM,
      ROLES.CLIENT_VIEWER,
    ],
  },
  issues: {
    path: "/issues",
    label: "Issues",
    icon: "AlertTriangle",
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.CONSULTANT,
      ROLES.SITE_TEAM,
    ],
  },
  team: {
    path: "/team",
    label: "Team",
    icon: "Users",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
  },
  activity: {
    path: "/activity",
    label: "Activity",
    icon: "Activity",
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.CONSULTANT,
      ROLES.SITE_TEAM,
    ],
  },
  settings: {
    path: "/settings",
    label: "Settings",
    icon: "Settings",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT, ROLES.SITE_TEAM],
  },
};

// Route-level view permissions (used by RequirePermission guards).
// Kept in sync with NAV_ITEMS so a hidden nav item is also a blocked route.
export const PERMISSIONS = {
  canViewProjects: () => true, // all roles

  canViewDocuments: () => true, // all roles; per-item visibility via canViewDocument

  canViewIssues: (role) =>
    [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.CONSULTANT,
      ROLES.SITE_TEAM,
    ].includes(role),

  canViewActivity: (role) =>
    [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.CONSULTANT,
      ROLES.SITE_TEAM,
    ].includes(role),

  canViewTeam: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),

  canCreateProject: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),

  canEditProject: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),

  canDeleteProject: (role) => role === ROLES.ADMIN,

  canCreateIssue: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT, ROLES.SITE_TEAM].includes(
      role
    ),

  canEditIssue: (role, issue, userId) => {
    if ([ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role)) return true;
    if (role === ROLES.CONSULTANT) return true;
    if (role === ROLES.SITE_TEAM) {
      return issue.assigneeId === userId;
    }
    return false;
  },

  canDeleteIssue: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),

  canCloseIssue: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT].includes(role),

  canResolveIssue: (role) =>
    [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.CONSULTANT,
      ROLES.SITE_TEAM,
    ].includes(role),

  canApproveIssue: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT].includes(role),

  canCreateDocument: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT].includes(role),

  canApproveDocument: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT].includes(role),

  canDeleteDocument: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),

  canViewFinancialDocuments: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT].includes(role),

  canViewContractDocuments: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT].includes(role),

  canViewBOQ: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT].includes(role),

  canInviteTeamMember: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),

  canManageTeamMember: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),

  canViewTeamManagement: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),

  canAccessSettings: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT, ROLES.SITE_TEAM].includes(
      role
    ),

  canAccessBilling: (role) => role === ROLES.ADMIN,

  canExportData: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONSULTANT].includes(role),

  canDeleteAccount: (role) => role === ROLES.ADMIN,

  canViewClientOnlyDocuments: true, // enforced by document flag

  canViewAllProjects: (role) =>
    [ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(role),
};

// Document categories that are restricted per role
export const RESTRICTED_CATEGORIES = {
  [ROLES.SITE_TEAM]: ["BOQ", "Contracts"],
  [ROLES.CLIENT_VIEWER]: [], // handled by clientVisible flag
};

// Helper to check if a role can see a document
export function canViewDocument(role, document) {
  // Site team cannot see financial/contract docs
  if (role === ROLES.SITE_TEAM) {
    if (["BOQ", "Contracts"].includes(document.category)) return false;
  }
  // Client viewer only sees client-visible docs
  if (role === ROLES.CLIENT_VIEWER) {
    return document.clientVisible === true;
  }
  return true;
}