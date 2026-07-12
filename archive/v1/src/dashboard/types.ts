export type DashboardModuleKey =
  | "projects"
  | "crm"
  | "finance"
  | "production-music"
  | "portfolio"
  | "game-jams";

export type DashboardBusinessHealthStatus =
  | "healthy"
  | "needs_attention"
  | "critical";

export type DashboardPrioritySeverity = "critical" | "warning" | "normal";

export interface DashboardDatabaseLink {
  readonly moduleKey: DashboardModuleKey;
  readonly label: string;
  readonly url: string;
}

export interface DashboardMetric {
  readonly label: string;
  readonly value: string;
}

export interface DashboardPriority {
  readonly moduleKey: DashboardModuleKey;
  readonly severity: DashboardPrioritySeverity;
  readonly action: string;
  readonly reason: string;
}

export interface DashboardWidget {
  readonly moduleKey: DashboardModuleKey;
  readonly title: string;
  readonly metrics: readonly DashboardMetric[];
  readonly insight: string;
  readonly recommendedAction: string;
  readonly databaseLink: DashboardDatabaseLink;
}

export interface DashboardBusinessHealth {
  readonly status: DashboardBusinessHealthStatus;
  readonly label: string;
  readonly score: number;
}

export interface DashboardExecutiveSummary {
  readonly businessHealth: DashboardBusinessHealth;
  readonly activeProjects: number;
  readonly currentPriorities: number;
  readonly financialSnapshot: string;
  readonly immediateRisks: readonly string[];
}

export interface DashboardModel {
  readonly title: "CEO Dashboard";
  readonly generatedAtIso: string;
  readonly executiveSummary: DashboardExecutiveSummary;
  readonly priorities: readonly DashboardPriority[];
  readonly widgets: readonly DashboardWidget[];
}

export interface ProjectDashboardRecord {
  readonly status?: string;
  readonly priority?: string;
  readonly targetCompletion?: string;
}

export interface CrmDashboardRecord {
  readonly relationshipStatus?: string;
  readonly nextFollowUp?: string;
  readonly lastContact?: string;
}

export interface FinanceDashboardRecord {
  readonly transactionType?: string;
  readonly status?: string;
  readonly amount?: number;
  readonly date?: string;
}

export interface ProductionMusicDashboardRecord {
  readonly status?: string;
  readonly published?: boolean;
}

export interface PortfolioDashboardRecord {
  readonly status?: string;
  readonly featured?: boolean;
}

export interface GameJamsDashboardRecord {
  readonly status?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

export interface DashboardBusinessData {
  readonly generatedAtIso: string;
  readonly projects: readonly ProjectDashboardRecord[];
  readonly crm: readonly CrmDashboardRecord[];
  readonly finance: readonly FinanceDashboardRecord[];
  readonly productionMusic: readonly ProductionMusicDashboardRecord[];
  readonly portfolio: readonly PortfolioDashboardRecord[];
  readonly gameJams: readonly GameJamsDashboardRecord[];
  readonly links: Record<DashboardModuleKey, DashboardDatabaseLink>;
}
