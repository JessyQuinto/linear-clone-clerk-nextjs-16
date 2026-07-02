/* eslint-disable */
/**
 * Local mock database backed by localStorage.
 * Implements a reactive system with a pub-sub subscription model so React components
 * update automatically when mutations are executed.
 */

// Simple pub-sub implementation
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notify() {
  listeners.forEach((l) => l());
}

// Helper to generate unique IDs
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

// Initial seed data
const SEED_USERS = [
  {
    _id: "user_jessy",
    clerkId: "user_clerk_jessy",
    name: "Jessy Quinto",
    email: "jessy@example.com",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
  },
  {
    _id: "user_jane",
    clerkId: "user_clerk_jane",
    name: "Jane Doe",
    email: "jane@acme.com",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  },
  {
    _id: "user_john",
    clerkId: "user_clerk_john",
    name: "John Smith",
    email: "john@acme.com",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  },
];

const SEED_ORGS = [
  {
    _id: "org_acme",
    clerkOrgId: "org_clerk_acme",
    name: "STYT LTDA",
    slug: "acme",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80",
  },
];

const SEED_MEMBERS = [
  {
    _id: "member_jessy",
    orgId: "org_acme",
    userId: "user_jessy",
    role: "admin" as const,
    clerkMembershipId: "membership_jessy",
  },
  {
    _id: "member_jane",
    orgId: "org_acme",
    userId: "user_jane",
    role: "member" as const,
    clerkMembershipId: "membership_jane",
  },
];

const SEED_TEAMS = [
  {
    _id: "team_eng",
    orgId: "org_acme",
    name: "Ingeniería",
    key: "ING",
    description: "Equipo de ingeniería principal desarrollando PANEL STYT",
    nextIssueNumber: 5,
  },
  {
    _id: "team_des",
    orgId: "org_acme",
    name: "Diseño",
    key: "DIS",
    description: "Equipo de diseño de producto y UI/UX",
    nextIssueNumber: 3,
  },
];

const SEED_PROJECTS = [
  {
    _id: "project_linear_redesign",
    orgId: "org_acme",
    name: "MultiBotsAgent",
    description: "Plataforma plug & play para configurar, desplegar y gestionar agentes de IA especializados sobre canales de mensajería masiva.",
    status: "in_progress" as const,
    leadId: "user_jane",
    targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    color: "#5e6ad2",
  },
  {
    _id: "project_marketing_site",
    orgId: "org_acme",
    name: "KardStore",
    description: "Sistema de pasarela y tarjetas de regalo digitales corporativas integradas.",
    status: "planned" as const,
    leadId: "user_jessy",
    targetDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days
    color: "#10b981",
  },
];

const SEED_CYCLES = [
  {
    _id: "cycle_1",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 1,
    name: "MB-I01 Plataforma de Agentes",
    startDate: Date.now() - 3 * 24 * 60 * 60 * 1000, // started 3 days ago
    endDate: Date.now() + 4 * 24 * 60 * 60 * 1000, // ends in 4 days
  },
  {
    _id: "cycle_2",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 2,
    name: "MB-I02 Portal de Clientes",
    startDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 12 * 24 * 60 * 60 * 1000,
  },
];

const SEED_LABELS = [
  { _id: "label_bug", orgId: "org_acme", name: "Error / Bug", color: "#ef4444" },
  { _id: "label_feature", orgId: "org_acme", name: "Slice / Funcionalidad", color: "#3b82f6" },
  { _id: "label_improvement", orgId: "org_acme", name: "Mejora", color: "#a855f7" },
  { _id: "label_docs", orgId: "org_acme", name: "Documentación", color: "#10b981" },
];

const SEED_ISSUES = [
  {
    _id: "issue_eng_1",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 1,
    title: "SOL 12 ➔ Slice 1: Consulta de Métricas",
    description: "QA de la Solución 12: Sistema de Métricas y Analíticas. Pruebas de API REST.",
    status: "in_progress" as const,
    priority: "high" as const,
    assigneeId: "user_jessy",
    creatorId: "user_jane",
    projectId: "project_linear_redesign",
    cycleId: "cycle_1",
    estimate: 5,
    dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    sortOrder: 1.0,
  },
  {
    _id: "issue_eng_2",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 2,
    title: "SOL 14 ➔ Slice 2: Autenticación JWT",
    description: "Validación de criterios de aceptación de la Solución 14: Gestión de Empresas y Acceso.",
    status: "todo" as const,
    priority: "medium" as const,
    assigneeId: "user_john",
    creatorId: "user_jessy",
    projectId: "project_linear_redesign",
    cycleId: "cycle_1",
    estimate: 3,
    sortOrder: 2.0,
  },
  {
    _id: "issue_eng_3",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 3,
    title: "SOL 05 ➔ Slice 3: Recepción Mensajes",
    description: "Verificar webhook de recepción de mensajes desde el proveedor externo.",
    status: "done" as const,
    priority: "low" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_linear_redesign",
    cycleId: "cycle_1",
    estimate: 1,
    sortOrder: 3.0,
  },
  {
    _id: "issue_eng_4",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 4,
    title: "SOL 08 ➔ Slice 04: Devolución Control",
    description: "Manejar timeouts para devolver el control al agente humano en la conversación.",
    status: "backlog" as const,
    priority: "none" as const,
    creatorId: "user_john",
    projectId: "project_linear_redesign",
    cycleId: "cycle_1",
    sortOrder: 4.0,
  },
];

const SEED_ISSUE_LABELS = [
  { _id: "il_1", issueId: "issue_eng_1", labelId: "label_feature" },
  { _id: "il_2", issueId: "issue_eng_1", labelId: "label_improvement" },
  { _id: "il_3", issueId: "issue_eng_2", labelId: "label_feature" },
  { _id: "il_4", issueId: "issue_eng_3", labelId: "label_docs" },
];

const SEED_COMMENTS = [
  {
    _id: "comment_1",
    orgId: "org_acme",
    issueId: "issue_eng_1",
    authorId: "user_jane",
    body: "¡Hola Jessy! Empecé esta tarea, dejé algunas notas en la descripción. Avisame si necesitás ayuda con dnd-kit.",
  },
  {
    _id: "comment_2",
    orgId: "org_acme",
    issueId: "issue_eng_1",
    authorId: "user_jessy",
    body: "Excelente, Jane. Estoy trabajando en eso ahora mismo. ¡El estado de arrastre ya se ve sólido!",
  },
];

const SEED_ACTIVITIES = [
  {
    _id: "act_1",
    orgId: "org_acme",
    issueId: "issue_eng_1",
    actorId: "user_jane",
    type: "created",
  },
  {
    _id: "act_2",
    orgId: "org_acme",
    issueId: "issue_eng_1",
    actorId: "user_jessy",
    type: "assigned",
    field: "assigneeId",
    newValue: "Jessy Quinto",
  },
  {
    _id: "act_3",
    orgId: "org_acme",
    issueId: "issue_eng_1",
    actorId: "user_jessy",
    type: "status_changed",
    field: "status",
    oldValue: "todo",
    newValue: "in_progress",
  },
];

const SEED_VIEWS = [
  {
    _id: "view_my_issues",
    orgId: "org_acme",
    creatorId: "user_jessy",
    name: "Mis tareas",
    filters: JSON.stringify({ assigneeId: "user_jessy" }),
    shared: false,
  },
];

const DB_KEYS = {
  users: "panel_styt_mock_users",
  organizations: "panel_styt_mock_orgs",
  members: "panel_styt_mock_members",
  teams: "panel_styt_mock_teams",
  issues: "panel_styt_mock_issues",
  labels: "panel_styt_mock_labels",
  issueLabels: "panel_styt_mock_issue_labels",
  issueRelations: "panel_styt_mock_issue_relations",
  comments: "panel_styt_mock_comments",
  activity: "panel_styt_mock_activity",
  projects: "panel_styt_mock_projects",
  cycles: "panel_styt_mock_cycles",
  views: "panel_styt_mock_views",
  attachments: "panel_styt_mock_attachments",
};

// Initialize DB with seed data if empty
export function initDb() {
  if (typeof window === "undefined") return;

  const getOrSet = (key: string, seed: any) => {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data);
  };

  getOrSet(DB_KEYS.users, SEED_USERS);
  getOrSet(DB_KEYS.organizations, SEED_ORGS);
  getOrSet(DB_KEYS.members, SEED_MEMBERS);
  getOrSet(DB_KEYS.teams, SEED_TEAMS);
  getOrSet(DB_KEYS.issues, SEED_ISSUES);
  getOrSet(DB_KEYS.labels, SEED_LABELS);
  getOrSet(DB_KEYS.issueLabels, SEED_ISSUE_LABELS);
  getOrSet(DB_KEYS.issueRelations, []);
  getOrSet(DB_KEYS.comments, SEED_COMMENTS);
  getOrSet(DB_KEYS.activity, SEED_ACTIVITIES);
  getOrSet(DB_KEYS.projects, SEED_PROJECTS);
  getOrSet(DB_KEYS.cycles, SEED_CYCLES);
  getOrSet(DB_KEYS.views, SEED_VIEWS);
  getOrSet(DB_KEYS.attachments, []);
}

// DB Accessors
export function getTable<T = any>(table: keyof typeof DB_KEYS): T[] {
  if (typeof window === "undefined") {
    // Return seed mock data server-side
    switch (table) {
      case "users": return SEED_USERS as any;
      case "organizations": return SEED_ORGS as any;
      case "members": return SEED_MEMBERS as any;
      case "teams": return SEED_TEAMS as any;
      case "issues": return SEED_ISSUES as any;
      case "labels": return SEED_LABELS as any;
      case "issueLabels": return SEED_ISSUE_LABELS as any;
      case "comments": return SEED_COMMENTS as any;
      case "activity": return SEED_ACTIVITIES as any;
      case "projects": return SEED_PROJECTS as any;
      case "cycles": return SEED_CYCLES as any;
      case "views": return SEED_VIEWS as any;
      default: return [];
    }
  }
  initDb();
  const key = DB_KEYS[table];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveTable(table: keyof typeof DB_KEYS, data: any[]) {
  if (typeof window === "undefined") return;
  const key = DB_KEYS[table];
  localStorage.setItem(key, JSON.stringify(data));
  notify();
}

export function insertRow(table: keyof typeof DB_KEYS, row: any) {
  const rows = getTable(table);
  const newRow = {
    _id: generateId(table),
    _creationTime: Date.now(),
    ...row,
  };
  rows.push(newRow);
  saveTable(table, rows);
  return newRow;
}

export function updateRow(table: keyof typeof DB_KEYS, id: string, updates: any) {
  const rows = getTable(table);
  const index = rows.findIndex((r: any) => r._id === id);
  if (index !== -1) {
    rows[index] = { ...rows[index], ...updates };
    saveTable(table, rows);
    return rows[index];
  }
  return null;
}

export function deleteRow(table: keyof typeof DB_KEYS, id: string) {
  const rows = getTable(table);
  const filtered = rows.filter((r: any) => r._id !== id);
  if (filtered.length !== rows.length) {
    saveTable(table, filtered);
    return true;
  }
  return false;
}
