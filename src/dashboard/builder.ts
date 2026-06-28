import type {
  DashboardBusinessData,
  DashboardBusinessHealth,
  DashboardModel,
} from "./types.js";
import { buildCRMWidget } from "./widgets/crm.js";
import { buildExecutiveSummary } from "./widgets/executive-summary.js";
import { buildFinanceWidget } from "./widgets/finance.js";
import { buildGameJamsWidget } from "./widgets/game-jams.js";
import { buildPortfolioWidget } from "./widgets/portfolio.js";
import { buildPriorities } from "./widgets/priorities.js";
import { buildProductionMusicWidget } from "./widgets/production-music.js";
import { buildProjectsWidget } from "./widgets/projects.js";

function parseDate(dateIso: string | undefined): Date | null {
  if (!dateIso) {
    return null;
  }

  const date = new Date(dateIso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysFromNow(date: Date, now: Date): number {
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.floor((date.getTime() - now.getTime()) / dayMs);
}

function calculateBusinessHealth(
  data: DashboardBusinessData,
): DashboardBusinessHealth {
  const now = new Date(data.generatedAtIso);
  const activeStatuses = new Set([
    "active",
    "scoping",
    "inquiry",
    "waiting_feedback",
  ]);

  const overdueProjects = data.projects.filter((project) => {
    const status = project.status?.toLowerCase();
    if (!status || !activeStatuses.has(status)) {
      return false;
    }

    const date = parseDate(project.targetCompletion);
    return date !== null && daysFromNow(date, now) < 0;
  }).length;

  const overdueInvoices = data.finance.filter((entry) => {
    const type = entry.transactionType?.toLowerCase();
    const status = entry.status?.toLowerCase();
    if (type !== "income" || status !== "pending") {
      return false;
    }

    const date = parseDate(entry.date);
    return date !== null && daysFromNow(date, now) < 0;
  }).length;

  const overdueFollowUps = data.crm.filter((entry) => {
    const date = parseDate(entry.nextFollowUp);
    return date !== null && daysFromNow(date, now) < 0;
  }).length;

  const activeProjects = data.projects.filter((project) =>
    activeStatuses.has(project.status?.toLowerCase() ?? ""),
  ).length;

  const readyProductionMusic = data.productionMusic.filter(
    (item) => item.status?.toLowerCase() === "ready",
  ).length;

  // Deterministic and intentionally simple scoring for v1.0.
  const score =
    Math.min(overdueProjects, 3) * 4 +
    Math.min(overdueInvoices, 3) * 3 +
    Math.min(overdueFollowUps, 3) * 2 -
    Math.min(activeProjects, 3) -
    Math.min(readyProductionMusic, 2);

  if (score >= 8) {
    return { status: "critical", label: "🔴 Critical", score };
  }

  if (score >= 3) {
    return { status: "needs_attention", label: "🟡 Needs Attention", score };
  }

  return { status: "healthy", label: "🟢 Healthy", score };
}

export function buildDashboardModel(
  data: DashboardBusinessData,
): DashboardModel {
  const businessHealth = calculateBusinessHealth(data);
  const priorities = buildPriorities(data);

  const projectsWidget = buildProjectsWidget({
    records: data.projects,
    generatedAtIso: data.generatedAtIso,
    link: data.links.projects,
  });

  const crmWidget = buildCRMWidget({
    records: data.crm,
    generatedAtIso: data.generatedAtIso,
    link: data.links.crm,
  });

  const finance = buildFinanceWidget({
    records: data.finance,
    generatedAtIso: data.generatedAtIso,
    link: data.links.finance,
  });

  const productionMusicWidget = buildProductionMusicWidget({
    records: data.productionMusic,
    link: data.links["production-music"],
  });

  const portfolioWidget = buildPortfolioWidget({
    records: data.portfolio,
    link: data.links.portfolio,
  });

  const gameJamsWidget = buildGameJamsWidget({
    records: data.gameJams,
    generatedAtIso: data.generatedAtIso,
    link: data.links["game-jams"],
  });

  const activeProjects = data.projects.filter((item) =>
    ["active", "scoping", "inquiry", "waiting_feedback"].includes(
      item.status?.toLowerCase() ?? "",
    ),
  ).length;

  const executiveSummary = buildExecutiveSummary({
    businessHealth,
    activeProjects,
    priorities,
    monthlyBalance: finance.monthlyBalance,
  });

  return {
    title: "CEO Dashboard",
    generatedAtIso: data.generatedAtIso,
    executiveSummary,
    priorities,
    widgets: [
      projectsWidget,
      crmWidget,
      finance.widget,
      productionMusicWidget,
      portfolioWidget,
      gameJamsWidget,
    ],
  };
}
