/**
 * Stub plan definitions. All features are free — no billing gates.
 * This file exists only so existing imports don't break.
 */

export type OrgPlan = "free" | "pro" | "enterprise";
export type PlanSlug = "free_org" | "pro" | "enterprise";
export type BillingPeriod = "month" | "annual";

export const PLAN_FEATURES = {
  aiAgent: "ai_agent",
  unlimitedProjects: "unlimited_projects",
  unlimitedIssues: "unlimited_issues",
  unlimitedSeats: "unlimited_seats",
  unlimitedAi: "unlimited_ai",
  prioritySupport: "priority_support",
} as const;

export type PlanFeatureSlug =
  (typeof PLAN_FEATURES)[keyof typeof PLAN_FEATURES];

export const FREE_PLAN_DISPLAY_LIMITS = {
  seats: Infinity,
  projects: Infinity,
  issues: Infinity,
} as const;

export type PlanDefinition = {
  plan: OrgPlan;
  slug: PlanSlug;
  clerkPlanId: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  priceNote?: string;
  maxSeats: number | null;
  highlights: string[];
  highlightsLeadIn?: string;
  popular?: boolean;
};

export const FREE_PLAN: PlanDefinition = {
  plan: "free",
  slug: "free_org",
  clerkPlanId: "",
  name: "Gratis",
  tagline: "Todas las funciones, sin límites.",
  monthlyPrice: 0,
  annualMonthlyPrice: 0,
  maxSeats: null,
  highlights: [
    "Miembros ilimitados",
    "Proyectos ilimitados",
    "Tareas ilimitadas",
    "Agente IA incluido",
  ],
};

export const PRO_PLAN = FREE_PLAN;
export const ENTERPRISE_PLAN = FREE_PLAN;
export const PLANS: PlanDefinition[] = [FREE_PLAN];

const PLANS_BY_ORG_PLAN: Record<OrgPlan, PlanDefinition> = {
  free: FREE_PLAN,
  pro: FREE_PLAN,
  enterprise: FREE_PLAN,
};

export function planForOrg(plan: OrgPlan): PlanDefinition {
  return PLANS_BY_ORG_PLAN[plan];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function priceForPeriod(
  plan: PlanDefinition,
  period: BillingPeriod
): number {
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatPrice(amount: number): string {
  return "$0";
}

export type ComparisonValue = string | boolean;

export type ComparisonRow = {
  label: string;
  values: [ComparisonValue, ComparisonValue, ComparisonValue];
};

export type ComparisonSection = {
  title: string;
  rows: ComparisonRow[];
};

export const COMPARISON_SECTIONS: ComparisonSection[] = [];
