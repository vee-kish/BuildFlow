/* BuildFlow Kenya - Mock data
   All demo data lives here. The services layer (src/services/api.js) reads
   from this file so it can later be swapped for real API calls without
   touching UI components.
*/

import { ROLES } from "./permissions";

export const FIRM = {
  name: "Skyline Build Consultants",
  shortName: "Skyline Build",
  product: "BuildFlow Kenya",
  location: "Nairobi, Kenya",
};

// Demo password shared by all demo accounts
export const DEMO_PASSWORD = "buildflow123";

export const USERS = [
  {
    id: "u-admin",
    name: "Amina Wanjiru",
    email: "amina@skylinebuild.co.ke",
    role: ROLES.ADMIN,
    title: "Firm Administrator",
  },
  {
    id: "u-pm",
    name: "David Otieno",
    email: "david@skylinebuild.co.ke",
    role: ROLES.PROJECT_MANAGER,
    title: "Project Manager",
  },
  {
    id: "u-consultant",
    name: "Grace Kimani",
    email: "grace@skylinebuild.co.ke",
    role: ROLES.CONSULTANT,
    title: "Structural Engineer",
  },
  {
    id: "u-site",
    name: "Peter Mwangi",
    email: "peter@skylinebuild.co.ke",
    role: ROLES.SITE_TEAM,
    title: "Site Supervisor",
  },
  {
    id: "u-client",
    name: "Sarah Ali",
    email: "sarah@riversideholdings.co.ke",
    role: ROLES.CLIENT_VIEWER,
    title: "Client — Riverside Holdings",
  },
];

export const PROJECTS = [
  {
    id: "p-kilimani",
    name: "Kilimani Heights Apartments",
    client: "Kilimani Heights Ltd",
    location: "Kilimani, Nairobi",
    status: "active",
    completion: 62,
    documentCount: 48,
    documentsAwaitingReview: 5,
    openIssues: 7,
    overdueItems: 2,
    startDate: "2026-02-09",
    targetDate: "2027-03-31",
    budgetKES: 480_000_000,
    managerId: "u-pm",
    description: "18-storey residential tower with 96 apartments and podium parking.",
    milestones: [
      { id: "m1", title: "Substructure complete", date: "2026-05-30", status: "done" },
      { id: "m2", title: "Superstructure to level 10", date: "2026-09-15", status: "done" },
      { id: "m3", title: "Superstructure to level 18", date: "2026-12-10", status: "in-progress" },
      { id: "m4", title: "Roofing and facade seal-off", date: "2027-01-29", status: "upcoming" },
      { id: "m5", title: "Handover", date: "2027-03-31", status: "upcoming" },
    ],
  },
  {
    id: "p-riverside",
    name: "Riverside Office Fit-Out",
    client: "Riverside Holdings",
    location: "Riverside Drive, Nairobi",
    status: "active",
    completion: 34,
    documentCount: 31,
    documentsAwaitingReview: 3,
    openIssues: 4,
    overdueItems: 1,
    startDate: "2026-06-01",
    targetDate: "2026-12-18",
    budgetKES: 92_000_000,
    managerId: "u-pm",
    description: "Fit-out of floors 3–5 for a corporate tenant, including MEP upgrades.",
    milestones: [
      { id: "m6", title: "Demolition and strip-out", date: "2026-06-25", status: "done" },
      { id: "m7", title: "MEP first fix", date: "2026-09-30", status: "in-progress" },
      { id: "m8", title: "Partitions and ceilings", date: "2026-11-06", status: "upcoming" },
      { id: "m9", title: "Practical completion", date: "2026-12-18", status: "upcoming" },
    ],
  },
  {
    id: "p-westlands",
    name: "Westlands Retail Renovation",
    client: "Westgate Retail Group",
    location: "General Mathenge Drive, Westlands",
    status: "on-hold",
    completion: 88,
    documentCount: 26,
    documentsAwaitingReview: 1,
    openIssues: 2,
    overdueItems: 3,
    startDate: "2026-01-12",
    targetDate: "2026-10-30",
    budgetKES: 55_000_000,
    managerId: "u-pm",
    description: "Renovation of a retail block: storefronts, food court, and services refurbishment.",
    milestones: [
      { id: "m10", title: "Structural repairs", date: "2026-04-18", status: "done" },
      { id: "m11", title: "Storefront installation", date: "2026-08-22", status: "done" },
      { id: "m12", title: "Food court finishes", date: "2026-10-15", status: "in-progress" },
      { id: "m13", title: "Snag list clearance", date: "2026-10-30", status: "upcoming" },
    ],
  },
];

export const DOCUMENTS = [
  {
    id: "d1",
    title: "Structural GA Drawings — Rev C",
    projectId: "p-kilimani",
    category: "Drawings",
    status: "awaiting-review",
    uploadedBy: "u-consultant",
    updatedAt: "2026-09-20T09:12:00",
    clientVisible: true,
  },
  {
    id: "d2",
    title: "MEP Coordination Plan — Floor 3",
    projectId: "p-riverside",
    category: "Drawings",
    status: "awaiting-review",
    uploadedBy: "u-consultant",
    updatedAt: "2026-09-19T15:40:00",
    clientVisible: false,
  },
  {
    id: "d3",
    title: "Monthly Valuation No. 8 (BOQ)",
    projectId: "p-kilimani",
    category: "BOQ",
    status: "awaiting-review",
    uploadedBy: "u-pm",
    updatedAt: "2026-09-18T11:05:00",
    clientVisible: false,
  },
  {
    id: "d4",
    title: "Fit-Out Main Contract",
    projectId: "p-riverside",
    category: "Contracts",
    status: "approved",
    uploadedBy: "u-admin",
    updatedAt: "2026-09-12T08:30:00",
    clientVisible: false,
  },
  {
    id: "d5",
    title: "Progress Report — August 2026",
    projectId: "p-kilimani",
    category: "Reports",
    status: "approved",
    uploadedBy: "u-pm",
    updatedAt: "2026-09-15T17:20:00",
    clientVisible: true,
  },
  {
    id: "d6",
    title: "Facade Shop Drawings",
    projectId: "p-westlands",
    category: "Drawings",
    status: "awaiting-review",
    uploadedBy: "u-consultant",
    updatedAt: "2026-09-17T10:00:00",
    clientVisible: true,
  },
  {
    id: "d7",
    title: "Site Safety Plan — Rev B",
    projectId: "p-kilimani",
    category: "Reports",
    status: "approved",
    uploadedBy: "u-site",
    updatedAt: "2026-09-10T14:45:00",
    clientVisible: true,
  },
  {
    id: "d8",
    title: "Materials & Finishes Schedule — Rev A",
    projectId: "p-riverside",
    category: "Reports",
    status: "approved",
    uploadedBy: "u-consultant",
    updatedAt: "2026-09-14T09:20:00",
    clientVisible: true,
  },
  {
    id: "d9",
    title: "Floor 4 Layout Change Request",
    projectId: "p-riverside",
    category: "Drawings",
    status: "awaiting-review",
    uploadedBy: "u-pm",
    updatedAt: "2026-09-21T10:35:00",
    clientVisible: true,
  },
];

export const ISSUES = [
  {
    id: "i1",
    title: "Water ingress at level 4 slab joint",
    projectId: "p-kilimani",
    severity: "high",
    status: "open",
    assigneeId: "u-site",
    createdBy: "u-site",
    createdAt: "2026-09-20T07:50:00",
    dueDate: "2026-09-24",
    overdue: false,
  },
  {
    id: "i2",
    title: "RFI-112: Beam-column junction detail clash",
    projectId: "p-kilimani",
    severity: "medium",
    status: "open",
    assigneeId: "u-consultant",
    createdBy: "u-pm",
    createdAt: "2026-09-18T09:15:00",
    dueDate: "2026-09-25",
    overdue: false,
  },
  {
    id: "i3",
    title: "Ceiling grid misaligned at grid C3",
    projectId: "p-riverside",
    severity: "low",
    status: "in-progress",
    assigneeId: "u-site",
    createdBy: "u-consultant",
    createdAt: "2026-09-16T13:25:00",
    dueDate: "2026-09-19",
    overdue: true,
  },
  {
    id: "i4",
    title: "Fire rating certificate missing for stair doors",
    projectId: "p-westlands",
    severity: "high",
    status: "open",
    assigneeId: "u-pm",
    createdBy: "u-admin",
    createdAt: "2026-09-15T16:10:00",
    dueDate: "2026-09-18",
    overdue: true,
  },
  {
    id: "i5",
    title: "Scaffold inspection overdue — north elevation",
    projectId: "p-kilimani",
    severity: "high",
    status: "open",
    assigneeId: "u-site",
    createdBy: "u-pm",
    createdAt: "2026-09-19T06:40:00",
    dueDate: "2026-09-21",
    overdue: true,
  },
  {
    id: "i6",
    title: "HVAC duct routing conflicts with sprinkler line",
    projectId: "p-riverside",
    severity: "medium",
    status: "open",
    assigneeId: "u-consultant",
    createdBy: "u-site",
    createdAt: "2026-09-21T08:05:00",
    dueDate: "2026-09-28",
    overdue: false,
  },
];

export const ACTIVITIES = [
  {
    id: "a1",
    userId: "u-consultant",
    action: "uploaded",
    target: "Structural GA Drawings — Rev C",
    projectId: "p-kilimani",
    timestamp: "2026-09-22T08:05:00",
  },
  {
    id: "a2",
    userId: "u-site",
    action: "reported issue",
    target: "Water ingress at level 4 slab joint",
    projectId: "p-kilimani",
    timestamp: "2026-09-21T16:42:00",
  },
  {
    id: "a3",
    userId: "u-pm",
    action: "approved",
    target: "Progress Report — August 2026",
    projectId: "p-kilimani",
    timestamp: "2026-09-21T11:20:00",
  },
  {
    id: "a4",
    userId: "u-pm",
    action: "moved milestone",
    target: "MEP first fix → in progress",
    projectId: "p-riverside",
    timestamp: "2026-09-20T14:55:00",
  },
  {
    id: "a5",
    userId: "u-admin",
    action: "invited",
    target: "Sarah Ali (Client Viewer)",
    projectId: "p-riverside",
    timestamp: "2026-09-19T09:30:00",
  },
  {
    id: "a6",
    userId: "u-site",
    action: "added site photos to",
    target: "Daily site log — Riverside",
    projectId: "p-riverside",
    timestamp: "2026-09-18T17:10:00",
  },
];

export const SITE_UPDATES = [
  {
    id: "s1",
    projectId: "p-kilimani",
    title: "Level 12 slab pour completed",
    authorId: "u-site",
    timestamp: "2026-09-22T07:30:00",
    photoCount: 4,
  },
  {
    id: "s2",
    projectId: "p-kilimani",
    title: "Tower crane inspection passed",
    authorId: "u-site",
    timestamp: "2026-09-21T12:15:00",
    photoCount: 2,
  },
  {
    id: "s3",
    projectId: "p-riverside",
    title: "Floor 4 partition framing started",
    authorId: "u-site",
    timestamp: "2026-09-20T16:45:00",
    photoCount: 3,
  },
];

export const DEADLINES = [
  {
    id: "dl1",
    title: "Superstructure to level 18 — structural review",
    projectId: "p-kilimani",
    date: "2026-09-25",
    type: "review",
  },
  {
    id: "dl2",
    title: "MEP first fix inspection",
    projectId: "p-riverside",
    date: "2026-09-30",
    type: "inspection",
  },
  {
    id: "dl3",
    title: "Valuation No. 8 client sign-off",
    projectId: "p-kilimani",
    date: "2026-10-02",
    type: "approval",
  },
  {
    id: "dl4",
    title: "Food court finishes — snag walk",
    projectId: "p-westlands",
    date: "2026-10-15",
    type: "inspection",
  },
  {
    id: "dl5",
    title: "Practical completion — Riverside fit-out",
    projectId: "p-riverside",
    date: "2026-12-18",
    type: "milestone",
  },
];

export const NOTIFICATIONS = [
  {
    id: "n1",
    title: "3 documents awaiting your review",
    detail: "Kilimani Heights and Riverside Office Fit-Out",
    timestamp: "2026-09-22T07:15:00",
    unread: true,
  },
  {
    id: "n2",
    title: "Issue overdue: scaffold inspection",
    detail: "Kilimani Heights Apartments — due 21 Sep",
    timestamp: "2026-09-21T18:00:00",
    unread: true,
  },
  {
    id: "n3",
    title: "Milestone reached",
    detail: "Superstructure to level 10 — Kilimani Heights",
    timestamp: "2026-09-15T10:25:00",
    unread: false,
  },
];

// Lookup helpers (kept in mock data so services stay thin)
export function getUserById(id) {
  return USERS.find((u) => u.id === id);
}

export function getProjectById(id) {
  return PROJECTS.find((p) => p.id === id);
}
