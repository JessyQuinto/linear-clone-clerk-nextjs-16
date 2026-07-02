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
    name: "Juan Felipe Lamos",
    email: "jlamos@stt.com.co",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  },
  {
    _id: "user_john",
    clerkId: "user_clerk_john",
    name: "Jhon Mendoza",
    email: "jmendoza@stt.com.co",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  },
  {
    _id: "user_oscar",
    clerkId: "user_clerk_oscar",
    name: "Óscar Gómez",
    email: "ogomez@stt.com.co",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
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
  {
    _id: "member_john",
    orgId: "org_acme",
    userId: "user_john",
    role: "member" as const,
    clerkMembershipId: "membership_john",
  },
  {
    _id: "member_oscar",
    orgId: "org_acme",
    userId: "user_oscar",
    role: "member" as const,
    clerkMembershipId: "membership_oscar",
  },
];

const SEED_TEAMS = [
  {
    _id: "team_eng",
    orgId: "org_acme",
    name: "Ingeniería",
    key: "ING",
    description: "Equipo de ingeniería principal desarrollando PANEL STYT",
    nextIssueNumber: 15,
  },
];

const SEED_PROJECTS = [
  {
    _id: "project_mba",
    orgId: "org_acme",
    name: "MultiBotsAgent",
    description: "Plataforma plug & play para configurar, desplegar y gestionar agentes de IA especializados sobre canales de mensajería masiva.",
    status: "in_progress" as const,
    leadId: "user_jane",
    targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    color: "#5e6ad2",
  },
  {
    _id: "project_kard",
    orgId: "org_acme",
    name: "KardStore",
    description: "Sistema de pasarela y tarjetas de regalo digitales corporativas integradas.",
    status: "planned" as const,
    leadId: "user_jessy",
    targetDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
    color: "#10b981",
  },
];

// ── Initiatives (grouped by project) ──
const SEED_INITIATIVES = [
  // MultiBotsAgent initiatives
  {
    _id: "ini_empresas",
    orgId: "org_acme",
    projectId: "project_mba",
    name: "Gestión de Empresas y Acceso",
    description: "Autenticación JWT, registro de empresas, verificación de email, recuperación de contraseña y gestión de perfiles corporativos.",
    priority: "critical" as const,
    leadId: "user_jane",
  },
  {
    _id: "ini_rag",
    orgId: "org_acme",
    projectId: "project_mba",
    name: "Motor Agente RAG",
    description: "Motor de agente conversacional basado en Retrieval Augmented Generation con soporte multimodal, memoria persistente y deduplicación.",
    priority: "high" as const,
    leadId: "user_jane",
  },
  {
    _id: "ini_mensajes",
    orgId: "org_acme",
    projectId: "project_mba",
    name: "Recepción de Mensajes",
    description: "Webhooks de recepción para WhatsApp y Telegram, embedded signup y procesamiento de mensajes entrantes.",
    priority: "high" as const,
    leadId: "user_oscar",
  },
  {
    _id: "ini_cotizador",
    orgId: "org_acme",
    projectId: "project_mba",
    name: "Motor Agente Cotizador",
    description: "Agente especializado en cotizaciones automáticas con integración a catálogo de productos y cálculo de precios.",
    priority: "medium" as const,
    leadId: "user_jane",
  },
  {
    _id: "ini_agendamiento",
    orgId: "org_acme",
    projectId: "project_mba",
    name: "Motor Agente Agendamiento",
    description: "Bookings CRUD, integración con Google Calendar OAuth, gestión de canales Telegram e Inbox.",
    priority: "medium" as const,
    leadId: "user_jane",
  },
  {
    _id: "ini_contexto",
    orgId: "org_acme",
    projectId: "project_mba",
    name: "Gestión de Contexto Conversacional",
    description: "Ventana deslizante de contexto, persistencia de memoria, adaptador LangChain y mensaje de bienvenida.",
    priority: "low" as const,
    leadId: "user_oscar",
  },
  // KardStore initiatives
  {
    _id: "ini_kard_pasarela",
    orgId: "org_acme",
    projectId: "project_kard",
    name: "Pasarela de Pagos",
    description: "Integración con proveedores de pago para la compra y canje de tarjetas de regalo digitales.",
    priority: "high" as const,
    leadId: "user_jessy",
  },
  {
    _id: "ini_kard_catalogo",
    orgId: "org_acme",
    projectId: "project_kard",
    name: "Catálogo de Tarjetas",
    description: "CRUD de tarjetas de regalo, categorización, precios y gestión de inventario digital.",
    priority: "medium" as const,
    leadId: "user_jessy",
  },
];

// ── Cycles (now scoped to projects, not teams) ──
const SEED_CYCLES = [
  {
    _id: "cycle_1",
    orgId: "org_acme",
    projectId: "project_mba",
    number: 1,
    name: "Sprint Jun 16–30: Auth & RAG Core",
    startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 4 * 24 * 60 * 60 * 1000,
  },
  {
    _id: "cycle_2",
    orgId: "org_acme",
    projectId: "project_mba",
    number: 2,
    name: "Sprint Jul 1–14: Mensajería & Cotizador",
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

// ── Issues / Slices (now with initiativeId) ──
const SEED_ISSUES = [
  // Gestión de Empresas y Acceso (ini_empresas)
  {
    _id: "slice_reg",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 1,
    title: "Registro de Empresa y Usuario",
    description: "Flujo completo de registro de empresa con validación de datos corporativos.",
    status: "done" as const,
    priority: "high" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_empresas",
    cycleId: "cycle_1",
    estimate: 5,
    sortOrder: 1.0,
  },
  {
    _id: "slice_jwt",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 2,
    title: "Autenticación JWT",
    description: "Sistema de autenticación con tokens JWT, refresh tokens y manejo de sesiones.",
    status: "in_progress" as const,
    priority: "high" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_empresas",
    cycleId: "cycle_1",
    estimate: 5,
    sortOrder: 2.0,
  },
  {
    _id: "slice_perfil",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 3,
    title: "Gestión del Perfil de Empresa",
    description: "CRUD completo de perfil corporativo con logo, datos de contacto y configuraciones.",
    status: "todo" as const,
    priority: "medium" as const,
    assigneeId: "user_oscar",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_empresas",
    cycleId: "cycle_1",
    estimate: 3,
    sortOrder: 3.0,
  },
  {
    _id: "slice_email",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 6,
    title: "Verificación de Email",
    description: "Envío de email de verificación con código OTP y validación de dominio corporativo.",
    status: "todo" as const,
    priority: "medium" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_empresas",
    estimate: 2,
    sortOrder: 4.0,
  },
  {
    _id: "slice_recovery",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 7,
    title: "Recuperación de Contraseña",
    description: "Flujo de recuperación de contraseña con enlace temporal y validación de identidad.",
    status: "backlog" as const,
    priority: "low" as const,
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_empresas",
    estimate: 2,
    sortOrder: 5.0,
  },
  // Motor Agente RAG (ini_rag)
  {
    _id: "slice_rag_flow",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 8,
    title: "Flujo RAG Principal",
    description: "Pipeline completo de ingestion → retrieval → generation con vector store y reranking.",
    status: "in_progress" as const,
    priority: "high" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_rag",
    cycleId: "cycle_1",
    estimate: 8,
    sortOrder: 6.0,
  },
  {
    _id: "slice_rag_multi",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 9,
    title: "Soporte Multimodal",
    description: "Procesamiento de imágenes, PDFs y archivos adjuntos en el flujo RAG.",
    status: "todo" as const,
    priority: "medium" as const,
    assigneeId: "user_oscar",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_rag",
    estimate: 5,
    sortOrder: 7.0,
  },
  {
    _id: "slice_rag_dedup",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 10,
    title: "Deduplicación de Documentos",
    description: "Detección y eliminación de documentos duplicados en el vector store.",
    status: "backlog" as const,
    priority: "low" as const,
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_rag",
    estimate: 3,
    sortOrder: 8.0,
  },
  // Recepción de Mensajes (ini_mensajes)
  {
    _id: "slice_whatsapp",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 4,
    title: "Webhook Recepción WhatsApp",
    description: "Idempotencia, auditoría y procesamiento RAG para mensajes de WhatsApp.",
    status: "done" as const,
    priority: "high" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_mensajes",
    cycleId: "cycle_1",
    estimate: 3,
    sortOrder: 9.0,
  },
  {
    _id: "slice_embedded",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 5,
    title: "Embedded Signup WhatsApp",
    description: "Flujo de Embedded Signup / Conexión de Canal WhatsApp vía Meta API.",
    status: "done" as const,
    priority: "medium" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_mensajes",
    estimate: 3,
    sortOrder: 10.0,
  },
  // Motor Agente Cotizador (ini_cotizador)
  {
    _id: "slice_cotizador",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 11,
    title: "Motor de Cotización Automática",
    description: "QA de la PR #34 — Motor de Agente Cotizador con pruebas API + manuales (UI + Telegram).",
    status: "done" as const,
    priority: "medium" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_cotizador",
    cycleId: "cycle_2",
    estimate: 5,
    sortOrder: 11.0,
  },
  // Motor Agente Agendamiento (ini_agendamiento)
  {
    _id: "slice_bookings",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 12,
    title: "Bookings CRUD + Google Calendar",
    description: "Bookings CRUD, Google Calendar OAuth, Telegram Channel, Inbox. PR #32.",
    status: "done" as const,
    priority: "medium" as const,
    assigneeId: "user_jane",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_agendamiento",
    cycleId: "cycle_2",
    estimate: 5,
    sortOrder: 12.0,
  },
  // Gestión de Contexto (ini_contexto)
  {
    _id: "slice_contexto",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 13,
    title: "Recuperación de Contexto Conversacional",
    description: "Ventana deslizante, persistencia, adaptador LangChain y degradación graceful.",
    status: "done" as const,
    priority: "low" as const,
    assigneeId: "user_oscar",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_contexto",
    estimate: 3,
    sortOrder: 13.0,
  },
  {
    _id: "slice_bienvenida",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 14,
    title: "Mensaje de Bienvenida",
    description: "Disparo de welcomeMessage en sesiones nuevas vs existentes.",
    status: "done" as const,
    priority: "low" as const,
    assigneeId: "user_oscar",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_contexto",
    estimate: 1,
    sortOrder: 14.0,
  },
  // Devolución de control (sin iniciativa clara, agrupado bajo contexto)
  {
    _id: "slice_devolucion",
    orgId: "org_acme",
    teamId: "team_eng",
    number: 15,
    title: "Devolución del Control al Agente",
    description: "2 bugs críticos: timeout no persiste en Settings, resolver marca status incorrecto.",
    status: "in_progress" as const,
    priority: "high" as const,
    assigneeId: "user_oscar",
    creatorId: "user_jessy",
    projectId: "project_mba",
    initiativeId: "ini_contexto",
    cycleId: "cycle_1",
    estimate: 3,
    sortOrder: 15.0,
  },
];

// ── QA Records ──
const SEED_QA_RECORDS = [
  {
    _id: "qa_reg",
    orgId: "org_acme",
    sliceId: "slice_reg",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_jane",
    result: "observaciones" as const,
    severity: "media" as const,
    testsRun: ["Funcionales", "Seguridad", "Integración"],
    description: "Registro aprobado con observaciones menores en validación de campos.",
  },
  {
    _id: "qa_jwt",
    orgId: "org_acme",
    sliceId: "slice_jwt",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_jane",
    result: "fallido" as const,
    severity: "media" as const,
    testsRun: ["Funcionales", "Seguridad", "Integración"],
    description: "Validación de criterios de aceptación: Autenticación JWT — tokens expirados no redirigen correctamente.",
  },
  {
    _id: "qa_perfil",
    orgId: "org_acme",
    sliceId: "slice_perfil",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_oscar",
    result: "fallido" as const,
    severity: "media" as const,
    testsRun: ["Funcionales", "Seguridad", "Integración"],
    description: "Gestión del Perfil de Empresa — logo no se guarda al editar.",
  },
  {
    _id: "qa_email",
    orgId: "org_acme",
    sliceId: "slice_email",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_jane",
    result: "fallido" as const,
    severity: "media" as const,
    testsRun: ["Funcionales", "Seguridad", "Integración"],
    description: "Verificación de Email — código OTP no expira después de 5 minutos.",
  },
  {
    _id: "qa_whatsapp",
    orgId: "org_acme",
    sliceId: "slice_whatsapp",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_jane",
    result: "aprobado" as const,
    severity: "baja" as const,
    testsRun: ["Funcionales", "Seguridad", "Integración"],
    description: "Webhook WhatsApp: idempotencia, auditoría y procesamiento RAG. 20/20 tests PASS.",
  },
  {
    _id: "qa_embedded",
    orgId: "org_acme",
    sliceId: "slice_embedded",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_jane",
    result: "aprobado" as const,
    severity: "baja" as const,
    testsRun: ["Funcionales", "Seguridad", "Integración"],
    description: "Embedded Signup WhatsApp: 32/32 tests PASS. Property-based + integración.",
  },
  {
    _id: "qa_rag",
    orgId: "org_acme",
    sliceId: "slice_rag_flow",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_jane",
    result: "observaciones" as const,
    severity: "critica" as const,
    testsRun: ["Funcionales", "Seguridad", "Integración"],
    description: "Motor RAG: flujo RAG, multimodal, memoria, escalamiento, deduplicación. Dev ajustando observaciones.",
  },
  {
    _id: "qa_cotizador",
    orgId: "org_acme",
    sliceId: "slice_cotizador",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_jane",
    result: "aprobado" as const,
    severity: "alta" as const,
    testsRun: ["Funcionales", "Integración"],
    description: "Motor Agente Cotizador: pruebas API + manuales (UI + Telegram). Aprobado.",
  },
  {
    _id: "qa_bookings",
    orgId: "org_acme",
    sliceId: "slice_bookings",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_jane",
    result: "aprobado" as const,
    severity: "alta" as const,
    testsRun: ["Funcionales", "Integración"],
    description: "SOL-04: Bookings CRUD, Google Calendar OAuth, Telegram Channel. Aprobado.",
  },
  {
    _id: "qa_contexto",
    orgId: "org_acme",
    sliceId: "slice_contexto",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_oscar",
    result: "aprobado" as const,
    severity: "baja" as const,
    testsRun: ["Funcionales"],
    description: "Recuperación de contexto conversacional: 23/23 tests PASS.",
  },
  {
    _id: "qa_bienvenida",
    orgId: "org_acme",
    sliceId: "slice_bienvenida",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_oscar",
    result: "aprobado" as const,
    severity: "baja" as const,
    testsRun: ["Funcionales"],
    description: "Mensaje de bienvenida: 2/2 tests PASS.",
  },
  {
    _id: "qa_devolucion",
    orgId: "org_acme",
    sliceId: "slice_devolucion",
    projectId: "project_mba",
    testerId: "user_john",
    devId: "user_oscar",
    result: "fallido" as const,
    severity: "alta" as const,
    testsRun: ["Funcionales", "Seguridad", "Integración"],
    description: "2 bugs críticos: (1) timeout no persiste en Settings, (2) resolver marca status 'active' en vez de 'resolved'.",
  },
];

const SEED_ISSUE_LABELS = [
  { _id: "il_1", issueId: "slice_reg", labelId: "label_feature" },
  { _id: "il_2", issueId: "slice_jwt", labelId: "label_feature" },
  { _id: "il_3", issueId: "slice_rag_flow", labelId: "label_feature" },
  { _id: "il_4", issueId: "slice_whatsapp", labelId: "label_docs" },
  { _id: "il_5", issueId: "slice_devolucion", labelId: "label_bug" },
];

const SEED_COMMENTS = [
  {
    _id: "comment_1",
    orgId: "org_acme",
    issueId: "slice_jwt",
    authorId: "user_john",
    body: "JWT: los tokens expirados no redirigen al login. Hay que revisar el middleware de refresh.",
  },
  {
    _id: "comment_2",
    orgId: "org_acme",
    issueId: "slice_jwt",
    authorId: "user_jane",
    body: "Entendido, ya estoy revisando el interceptor de axios. Debería estar listo para mañana.",
  },
];

const SEED_ACTIVITIES = [
  {
    _id: "act_1",
    orgId: "org_acme",
    issueId: "slice_jwt",
    actorId: "user_jessy",
    type: "created",
  },
  {
    _id: "act_2",
    orgId: "org_acme",
    issueId: "slice_jwt",
    actorId: "user_jessy",
    type: "assigned",
    field: "assigneeId",
    newValue: "Juan Felipe Lamos",
  },
  {
    _id: "act_3",
    orgId: "org_acme",
    issueId: "slice_jwt",
    actorId: "user_jane",
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

const SEED_PROJECT_DOCUMENTS = [
  {
    _id: "doc_spec_notion",
    orgId: "org_acme",
    entityId: "project_mba",
    title: "Spec de Arquitectura — Notion",
    url: "https://notion.so/styt/architecture-spec",
    type: "link" as const,
  },
  {
    _id: "doc_qa_notes",
    orgId: "org_acme",
    entityId: "project_mba",
    title: "Notas de criterios de aceptación QA",
    content: "- Todos los endpoints deben retornar 200 en Happy Path.\n- Tokens JWT deben expirar después de 15 min.\n- Rate limiting: max 100 req/min por usuario.",
    type: "note" as const,
  },
  {
    _id: "doc_figma",
    orgId: "org_acme",
    entityId: "project_mba",
    title: "Mockups UI — Figma",
    url: "https://figma.com/file/abc123/panel-styt",
    type: "link" as const,
  },
  {
    _id: "doc_slice_jwt_spec",
    orgId: "org_acme",
    entityId: "slice_jwt",
    title: "Spec JWT — Notion",
    url: "https://notion.so/styt/jwt-spec",
    type: "link" as const,
  },
  {
    _id: "doc_slice_jwt_notes",
    orgId: "org_acme",
    entityId: "slice_jwt",
    title: "Notas de implementación JWT",
    content: "Usar jose para verificación de tokens. Refresh token en httpOnly cookie. Rotation cada 7 días.",
    type: "note" as const,
  },
  {
    _id: "doc_qa_rag_notes",
    orgId: "org_acme",
    entityId: "qa_rag",
    title: "Notas de observaciones RAG",
    content: "El endpoint de ingestion tarda >2s bajo carga. Considerar batch processing. El reranking necesita más pruebas con documentos largos.",
    type: "note" as const,
  },
  {
    _id: "doc_qa_rag_link",
    orgId: "org_acme",
    entityId: "qa_rag",
    title: "Reporte completo QA RAG — Google Docs",
    url: "https://docs.google.com/document/d/abc123",
    type: "link" as const,
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
  initiatives: "panel_styt_mock_initiatives",
  qaRecords: "panel_styt_mock_qa_records",
  projectDocuments: "panel_styt_mock_project_documents",
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
  getOrSet(DB_KEYS.initiatives, SEED_INITIATIVES);
  getOrSet(DB_KEYS.qaRecords, SEED_QA_RECORDS);
  getOrSet(DB_KEYS.projectDocuments, SEED_PROJECT_DOCUMENTS);
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
      case "initiatives": return SEED_INITIATIVES as any;
      case "qaRecords": return SEED_QA_RECORDS as any;
      case "projectDocuments": return SEED_PROJECT_DOCUMENTS as any;
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
