/* BuildFlow Kenya - Local "database"
   A tiny fake backend that seeds from mock data, persists to localStorage, and
   exposes helpers the API client (src/services/api.js) uses for CRUD. This lets
   Phase 2 pages create/edit records that survive a refresh without a real server.

   Swap path for a real backend: delete this file and reimplement api.js with
   fetch calls. No UI component imports localDb directly.
*/

import {
  ACTIVITIES,
  DEADLINES,
  DOCUMENTS,
  FIRM,
  ISSUES,
  NOTIFICATIONS,
  PROJECTS,
  SITE_UPDATES,
  USERS,
} from "../data/mockData";

const DB_KEY = "bfk.db.v1";

/* ------------------------------------------------------------------ */
/* Seed extensions layered on top of the flat mock data                */
/* ------------------------------------------------------------------ */

const PROJECT_TEAMS = {
  "p-kilimani": ["u-pm", "u-consultant", "u-site"],
  "p-riverside": ["u-pm", "u-consultant", "u-site"],
  "p-westlands": ["u-pm", "u-site"],
};

const DOCUMENT_META = {
  d1: { size: 4_820_000, type: "pdf" },
  d2: { size: 3_150_000, type: "pdf" },
  d3: { size: 1_240_000, type: "xlsx" },
  d4: { size: 2_680_000, type: "pdf" },
  d5: { size: 940_000, type: "pdf" },
  d6: { size: 5_120_000, type: "dwg" },
  d7: { size: 1_080_000, type: "pdf" },
  d8: { size: 760_000, type: "xlsx" },
  d9: { size: 1_940_000, type: "pdf" },
};

const ISSUE_DETAILS = {
  i1: {
    description:
      "Standing water observed along the construction joint on level 4 after rain. Possible failed waterstop. Needs inspection before the next pour.",
    photos: [
      { name: "level4-joint-01.jpg", size: 2_400_000 },
      { name: "level4-joint-02.jpg", size: 2_100_000 },
    ],
    comments: [
      {
        id: "c1",
        authorId: "u-pm",
        body: "Assigned to Peter. Please photograph and add a temporary drip line.",
        createdAt: "2026-09-20T10:15:00",
      },
    ],
  },
  i2: {
    description:
      "RFI-112 raised by the structural team: rebar congestion at the beam-column junction clashes with the MEP sleeve. Requesting a revised detail.",
    photos: [],
    comments: [
      {
        id: "c2",
        authorId: "u-consultant",
        body: "Sketching a revised junction detail; will issue by end of week.",
        createdAt: "2026-09-19T08:40:00",
      },
    ],
  },
  i3: {
    description:
      "Ceiling grid is out of alignment at grid C3 on floor 3, causing tile cuts. Layout needs to be re-set before closing up.",
    photos: [{ name: "ceiling-c3.jpg", size: 1_800_000 }],
    comments: [],
  },
  i4: {
    description:
      "Fire rating certificate for the new stair doors has not been submitted. Required for the occupancy inspection.",
    photos: [],
    comments: [],
  },
  i5: {
    description:
      "Scaffold tag on the north elevation is out of date. Weekly inspection overdue — do not allow work from this lift until re-inspected.",
    photos: [{ name: "scaffold-north.jpg", size: 1_600_000 }],
    comments: [
      {
        id: "c3",
        authorId: "u-site",
        body: "Scaffolder booked for first thing tomorrow.",
        createdAt: "2026-09-19T17:05:00",
      },
    ],
  },
  i6: {
    description:
      "HVAC duct routing on floor 4 conflicts with the sprinkler main. Coordination needed before ceiling framing closes up.",
    photos: [],
    comments: [],
  },
};

const USER_STATUS = {
  "u-admin": "active",
  "u-pm": "active",
  "u-consultant": "active",
  "u-site": "active",
  "u-client": "active",
};

const FIRM_PROFILE = {
  ...FIRM,
  email: "hello@skylinebuild.co.ke",
  phone: "+254 20 555 0142",
  website: "skylinebuild.co.ke",
  address: "Riverside Square, Riverside Drive, Nairobi",
  kraPin: "P051234567X",
};

const BILLING = {
  plan: "Studio",
  seats: 5,
  seatsUsed: 5,
  monthlyKES: 14_500,
  renewalDate: "2026-10-15",
  status: "active",
};

const STORAGE = {
  usedBytes: 12_800_000_000,
  totalBytes: 25_000_000_000,
};

/* ------------------------------------------------------------------ */
/* Seed construction                                                   */
/* ------------------------------------------------------------------ */

function projectIdsForUser(userId) {
  const ids = PROJECTS.filter(
    (p) => p.managerId === userId || (PROJECT_TEAMS[p.id] ?? []).includes(userId)
  ).map((p) => p.id);
  if (userId === "u-client") return ["p-riverside"];
  return ids;
}

function buildVersions(doc) {
  return [
    {
      version: 1,
      updatedAt: doc.updatedAt,
      updatedBy: doc.uploadedBy,
      note: "Initial upload",
    },
  ];
}

export function buildSeed() {
  return {
    firm: FIRM_PROFILE,
    billing: BILLING,
    storage: STORAGE,
    users: USERS.map((u) => ({
      ...u,
      status: USER_STATUS[u.id] ?? "active",
      projectIds: projectIdsForUser(u.id),
    })),
    projects: PROJECTS.map((p) => ({
      ...p,
      team: PROJECT_TEAMS[p.id] ?? [],
    })),
    documents: DOCUMENTS.map((d) => {
      const meta = DOCUMENT_META[d.id] ?? { size: 1_000_000, type: "pdf" };
      return {
        ...d,
        version: 1,
        fileSize: meta.size,
        fileType: meta.type,
        versions: buildVersions(d),
      };
    }),
    issues: ISSUES.map((i) => {
      const detail = ISSUE_DETAILS[i.id] ?? {
        description: "",
        photos: [],
        comments: [],
      };
      return {
        ...i,
        ...detail,
        history: [
          {
            id: `h-${i.id}-created`,
            action: "created",
            detail: "Issue created",
            byId: i.createdBy,
            at: i.createdAt,
          },
        ],
      };
    }),
    activities: [...ACTIVITIES],
    siteUpdates: [...SITE_UPDATES],
    deadlines: [...DEADLINES],
    notifications: [...NOTIFICATIONS],
  };
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache;
    }
  } catch {
    /* fall through to seed */
  }
  cache = buildSeed();
  write(cache);
  return cache;
}

function write(next) {
  cache = next;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(next));
  } catch {
    /* storage may be full or unavailable; in-memory cache still works */
  }
}

export function db() {
  return read();
}

export function save(mutator) {
  const current = read();
  const next = mutator(structuredClone(current)) ?? current;
  write(next);
  return structuredClone(next);
}

export function resetDb() {
  cache = null;
  try {
    localStorage.removeItem(DB_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function nowIso() {
  return new Date().toISOString().slice(0, 19);
}

/** Prepend an activity entry. Called by api.js after mutations. */
export function logActivity(state, { userId, action, target, projectId }) {
  const entry = {
    id: uid("a"),
    userId,
    action,
    target,
    projectId: projectId ?? null,
    timestamp: nowIso(),
  };
  state.activities.unshift(entry);
  return entry;
}
