/* BuildFlow Kenya - Service layer (API client)
   The single interface every page/component uses for data. Backed by localDb
   (a fake backend with localStorage persistence) plus simulated latency so
   loading states are real. To go live, reimplement each method with fetch();
   no UI changes are required because nothing imports localDb directly.

   Conventions:
   - Read methods accept an optional "actor" ({ role, userId }). When omitted
     they return everything (used by the role-agnostic Dashboard); when supplied
     they apply server-side visibility rules.
   - Mutation methods accept a `byId` (the acting user) and log activity.
*/

import {
  PERMISSIONS,
  ROLES,
  canViewDocument,
} from "../data/permissions";
import { DEMO_PASSWORD } from "../data/mockData";
import {
  db,
  logActivity,
  nowIso,
  save,
  uid,
} from "./localDb";

const LATENCY_MS = 350;

function simulate(compute) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(compute())), LATENCY_MS);
  });
}

/* ------------------------------------------------------------------ */
/* Shared visibility helpers                                           */
/* ------------------------------------------------------------------ */

function projectIdsFor(state, userId) {
  return state.users.find((u) => u.id === userId)?.projectIds ?? [];
}

function canAccessProject(state, role, userId, projectId) {
  if (!role) return true; // no actor supplied -> no filtering
  if (role === ROLES.ADMIN || PERMISSIONS.canViewAllProjects(role)) return true;
  return projectIdsFor(state, userId).includes(projectId);
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const authService = {
  login(email, password) {
    return simulate(() => {
      const user = db().users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!user || password !== DEMO_PASSWORD) {
        throw new Error("Invalid email or password.");
      }
      return { user };
    });
  },

  loginAsDemo(role) {
    return simulate(() => {
      const user = db().users.find((u) => u.role === role);
      if (!user) throw new Error("No demo account for this role.");
      return { user };
    });
  },
};

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const projectsService = {
  list({ role, userId } = {}) {
    return simulate(() => {
      const state = db();
      return state.projects.filter((p) =>
        canAccessProject(state, role, userId, p.id)
      );
    });
  },

  get(id) {
    return simulate(() => db().projects.find((p) => p.id === id) ?? null);
  },

  create(payload) {
    return simulate(() => {
      let created;
      save((state) => {
        created = {
          id: uid("p"),
          name: payload.name,
          client: payload.client,
          location: payload.location,
          status: payload.status ?? "planning",
          completion: 0,
          documentCount: 0,
          documentsAwaitingReview: 0,
          openIssues: 0,
          overdueItems: 0,
          startDate: payload.startDate,
          targetDate: payload.targetDate,
          budgetKES: Number(payload.budgetKES) || 0,
          managerId: payload.managerId,
          description: payload.description ?? "",
          team: payload.team ?? [],
          milestones: [],
        };
        state.projects.unshift(created);
        logActivity(state, {
          userId: payload.byId,
          action: "created project",
          target: created.name,
          projectId: created.id,
        });
        return state;
      });
      return created;
    });
  },

  update(id, patch) {
    return simulate(() => {
      let updated;
      save((state) => {
        const project = state.projects.find((p) => p.id === id);
        if (project) {
          Object.assign(project, patch);
          updated = project;
        }
        return state;
      });
      return updated ?? null;
    });
  },

  remove(id, byId) {
    return simulate(() => {
      let removedName = "";
      save((state) => {
        const project = state.projects.find((p) => p.id === id);
        removedName = project?.name ?? "";
        state.projects = state.projects.filter((p) => p.id !== id);
        logActivity(state, {
          userId: byId,
          action: "deleted project",
          target: removedName,
        });
        return state;
      });
      return { id, name: removedName };
    });
  },
};

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export const documentsService = {
  list({ role, userId, projectId } = {}) {
    return simulate(() => {
      const state = db();
      return state.documents
        .filter((d) => (projectId ? d.projectId === projectId : true))
        .filter((d) => (role ? canViewDocument(role, d) : true))
        .filter((d) => canAccessProject(state, role, userId, d.projectId));
    });
  },

  get(id) {
    return simulate(() => db().documents.find((d) => d.id === id) ?? null);
  },

  upload(payload) {
    return simulate(() => {
      let created;
      save((state) => {
        created = {
          id: uid("d"),
          title: payload.title,
          projectId: payload.projectId,
          category: payload.category,
          status: "awaiting-review",
          uploadedBy: payload.byId,
          updatedAt: nowIso(),
          clientVisible: Boolean(payload.clientVisible),
          version: 1,
          fileSize: Number(payload.fileSize) || 0,
          fileType: payload.fileType ?? "pdf",
          versions: [
            {
              version: 1,
              updatedAt: nowIso(),
              updatedBy: payload.byId,
              note: "Initial upload",
            },
          ],
        };
        state.documents.unshift(created);
        const project = state.projects.find((p) => p.id === payload.projectId);
        if (project) project.documentCount += 1;
        logActivity(state, {
          userId: payload.byId,
          action: "uploaded",
          target: created.title,
          projectId: created.projectId,
        });
        return state;
      });
      return created;
    });
  },

  addVersion(id, { note, byId }) {
    return simulate(() => {
      let updated;
      save((state) => {
        const doc = state.documents.find((d) => d.id === id);
        if (!doc) return state;
        doc.version += 1;
        doc.updatedAt = nowIso();
        doc.status = "awaiting-review";
        doc.versions.unshift({
          version: doc.version,
          updatedAt: doc.updatedAt,
          updatedBy: byId,
          note: note || `Revision ${doc.version}`,
        });
        updated = doc;
        logActivity(state, {
          userId: byId,
          action: "added a version to",
          target: doc.title,
          projectId: doc.projectId,
        });
        return state;
      });
      return updated ?? null;
    });
  },

  review(id, { status, note, byId }) {
    return simulate(() => {
      let updated;
      save((state) => {
        const doc = state.documents.find((d) => d.id === id);
        if (!doc) return state;
        doc.status = status; // "approved" | "changes-requested"
        doc.reviewNote = note ?? "";
        doc.reviewedBy = byId;
        doc.reviewedAt = nowIso();
        updated = doc;
        logActivity(state, {
          userId: byId,
          action: status === "approved" ? "approved" : "requested changes on",
          target: doc.title,
          projectId: doc.projectId,
        });
        return state;
      });
      return updated ?? null;
    });
  },

  remove(id, byId) {
    return simulate(() => {
      let removed;
      save((state) => {
        removed = state.documents.find((d) => d.id === id);
        state.documents = state.documents.filter((d) => d.id !== id);
        if (removed) {
          const project = state.projects.find((p) => p.id === removed.projectId);
          if (project) project.documentCount = Math.max(0, project.documentCount - 1);
          logActivity(state, {
            userId: byId,
            action: "deleted document",
            target: removed.title,
            projectId: removed.projectId,
          });
        }
        return state;
      });
      return removed ?? null;
    });
  },
};

/* ------------------------------------------------------------------ */
/* Issues                                                              */
/* ------------------------------------------------------------------ */

export const issuesService = {
  list({ role, userId, projectId } = {}) {
    return simulate(() => {
      const state = db();
      return state.issues.filter(
        (i) =>
          (projectId ? i.projectId === projectId : true) &&
          canAccessProject(state, role, userId, i.projectId)
      );
    });
  },

  get(id) {
    return simulate(() => db().issues.find((i) => i.id === id) ?? null);
  },

  create(payload) {
    return simulate(() => {
      let created;
      save((state) => {
        created = {
          id: uid("i"),
          title: payload.title,
          projectId: payload.projectId,
          severity: payload.severity ?? "medium",
          status: "open",
          assigneeId: payload.assigneeId ?? null,
          createdBy: payload.byId,
          createdAt: nowIso(),
          dueDate: payload.dueDate ?? null,
          overdue: false,
          description: payload.description ?? "",
          location: payload.location ?? "",
          photos: payload.photos ?? [],
          comments: [],
          history: [
            {
              id: uid("h"),
              action: "created",
              detail: "Issue created",
              byId: payload.byId,
              at: nowIso(),
            },
          ],
        };
        state.issues.unshift(created);
        const project = state.projects.find((p) => p.id === payload.projectId);
        if (project) project.openIssues += 1;
        logActivity(state, {
          userId: payload.byId,
          action: "reported issue",
          target: created.title,
          projectId: created.projectId,
        });
        return state;
      });
      return created;
    });
  },

  assign(id, { assigneeId, byId }) {
    return simulate(() => {
      let updated;
      save((state) => {
        const issue = state.issues.find((i) => i.id === id);
        if (!issue) return state;
        issue.assigneeId = assigneeId;
        const assignee = state.users.find((u) => u.id === assigneeId);
        issue.history.unshift({
          id: uid("h"),
          action: "assigned",
          detail: `Assigned to ${assignee?.name ?? "unassigned"}`,
          byId,
          at: nowIso(),
        });
        updated = issue;
        logActivity(state, {
          userId: byId,
          action: "reassigned",
          target: issue.title,
          projectId: issue.projectId,
        });
        return state;
      });
      return updated ?? null;
    });
  },

  updateStatus(id, { status, note, byId }) {
    return simulate(() => {
      let updated;
      save((state) => {
        const issue = state.issues.find((i) => i.id === id);
        if (!issue) return state;
        const previous = issue.status;
        issue.status = status;
        issue.history.unshift({
          id: uid("h"),
          action: "status",
          detail: `Status changed from ${previous} to ${status}${
            note ? ` — ${note}` : ""
          }`,
          byId,
          at: nowIso(),
        });
        const project = state.projects.find((p) => p.id === issue.projectId);
        if (project) {
          const wasOpen = previous !== "resolved" && previous !== "closed";
          const nowOpen = status !== "resolved" && status !== "closed";
          if (wasOpen && !nowOpen) project.openIssues = Math.max(0, project.openIssues - 1);
          if (!wasOpen && nowOpen) project.openIssues += 1;
        }
        updated = issue;
        logActivity(state, {
          userId: byId,
          action: `marked issue ${status}`,
          target: issue.title,
          projectId: issue.projectId,
        });
        return state;
      });
      return updated ?? null;
    });
  },

  comment(id, { body, authorId }) {
    return simulate(() => {
      let updated;
      save((state) => {
        const issue = state.issues.find((i) => i.id === id);
        if (!issue) return state;
        issue.comments.push({
          id: uid("c"),
          authorId,
          body,
          createdAt: nowIso(),
        });
        updated = issue;
        return state;
      });
      return updated ?? null;
    });
  },

  remove(id, byId) {
    return simulate(() => {
      let removed;
      save((state) => {
        removed = state.issues.find((i) => i.id === id);
        state.issues = state.issues.filter((i) => i.id !== id);
        if (removed) {
          const project = state.projects.find((p) => p.id === removed.projectId);
          if (project) project.openIssues = Math.max(0, project.openIssues - 1);
          logActivity(state, {
            userId: byId,
            action: "deleted issue",
            target: removed.title,
            projectId: removed.projectId,
          });
        }
        return state;
      });
      return removed ?? null;
    });
  },
};

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

export const teamService = {
  list() {
    return simulate(() => db().users);
  },

  get(id) {
    return simulate(() => db().users.find((u) => u.id === id) ?? null);
  },

  invite(payload) {
    return simulate(() => {
      let created;
      save((state) => {
        created = {
          id: uid("u"),
          name: payload.name,
          email: payload.email,
          role: payload.role,
          title: payload.title ?? "",
          status: "invited",
          projectIds: payload.projectIds ?? [],
        };
        state.users.push(created);
        created.projectIds.forEach((pid) => {
          const project = state.projects.find((p) => p.id === pid);
          if (project && !project.team.includes(created.id)) {
            project.team.push(created.id);
          }
        });
        logActivity(state, {
          userId: payload.byId,
          action: "invited",
          target: `${created.name} (${created.role.replace(/_/g, " ")})`,
        });
        return state;
      });
      return created;
    });
  },

  updateMember(id, patch) {
    return simulate(() => {
      let updated;
      save((state) => {
        const user = state.users.find((u) => u.id === id);
        if (!user) return state;
        const previousProjectIds = [...(user.projectIds ?? [])];
        Object.assign(user, patch);
        // Sync project team arrays when projectIds change
        if (patch.projectIds) {
          previousProjectIds.forEach((pid) => {
            if (!patch.projectIds.includes(pid)) {
              const project = state.projects.find((p) => p.id === pid);
              if (project) project.team = project.team.filter((m) => m !== id);
            }
          });
          patch.projectIds.forEach((pid) => {
            const project = state.projects.find((p) => p.id === pid);
            if (project && !project.team.includes(id)) project.team.push(id);
          });
        }
        updated = user;
        return state;
      });
      return updated ?? null;
    });
  },
};

/* ------------------------------------------------------------------ */
/* Activity                                                            */
/* ------------------------------------------------------------------ */

export const activityService = {
  list({ role, userId, projectId, action } = {}) {
    return simulate(() => {
      const state = db();
      return state.activities
        .filter((a) => (projectId ? a.projectId === projectId : true))
        .filter((a) => (action ? a.action === action : true))
        .filter((a) => canAccessProject(state, role, userId, a.projectId));
    });
  },

  siteUpdates({ projectId } = {}) {
    return simulate(() => {
      const state = db();
      return state.siteUpdates.filter((s) =>
        projectId ? s.projectId === projectId : true
      );
    });
  },

  actionTypes() {
    return simulate(() => {
      const set = new Set(db().activities.map((a) => a.action));
      return [...set];
    });
  },
};

/* ------------------------------------------------------------------ */
/* Deadlines & notifications                                           */
/* ------------------------------------------------------------------ */

export const deadlinesService = {
  list({ projectId } = {}) {
    return simulate(() =>
      db().deadlines.filter((d) => (projectId ? d.projectId === projectId : true))
    );
  },
};

export const notificationsService = {
  list() {
    return simulate(() => db().notifications);
  },
};

/* ------------------------------------------------------------------ */
/* Settings / firm / billing                                           */
/* ------------------------------------------------------------------ */

export const settingsService = {
  getFirm() {
    return simulate(() => db().firm);
  },

  updateFirm(patch) {
    return simulate(() => {
      let updated;
      save((state) => {
        state.firm = { ...state.firm, ...patch };
        updated = state.firm;
        return state;
      });
      return updated;
    });
  },

  getBilling() {
    return simulate(() => db().billing);
  },

  updateBilling(patch) {
    return simulate(() => {
      let updated;
      save((state) => {
        state.billing = { ...state.billing, ...patch };
        updated = state.billing;
        return state;
      });
      return updated;
    });
  },

  getStorage() {
    return simulate(() => db().storage);
  },

  getPersonal(userId) {
    return simulate(() => db().users.find((u) => u.id === userId) ?? null);
  },

  updatePersonal(userId, patch) {
    return simulate(() => {
      let updated;
      save((state) => {
        const user = state.users.find((u) => u.id === userId);
        if (!user) return state;
        Object.assign(user, patch);
        updated = user;
        return state;
      });
      return updated ?? null;
    });
  },
};
