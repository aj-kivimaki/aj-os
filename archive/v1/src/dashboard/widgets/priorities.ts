import type { DashboardBusinessData, DashboardPriority } from "../types.js";

interface CandidatePriority {
  readonly priority: DashboardPriority;
  readonly score: number;
}

function parseDate(dateIso: string | undefined): Date | null {
  if (!dateIso) {
    return null;
  }

  const value = new Date(dateIso);
  return Number.isNaN(value.getTime()) ? null : value;
}

function daysFromNow(date: Date, now: Date): number {
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.floor((date.getTime() - now.getTime()) / dayMs);
}

function byScoreDescending(a: CandidatePriority, b: CandidatePriority): number {
  return b.score - a.score;
}

export function buildPriorities(
  data: DashboardBusinessData,
): readonly DashboardPriority[] {
  const now = new Date(data.generatedAtIso);
  const priorities: CandidatePriority[] = [];

  const overdueProjects = data.projects.filter((project) => {
    const status = project.status?.toLowerCase();
    if (!status || ["completed", "cancelled", "archived"].includes(status)) {
      return false;
    }

    const targetCompletion = parseDate(project.targetCompletion);
    if (!targetCompletion) {
      return false;
    }

    return daysFromNow(targetCompletion, now) < 0;
  }).length;

  if (overdueProjects > 0) {
    priorities.push({
      priority: {
        moduleKey: "projects",
        severity: "critical",
        action: "Finish overdue project milestones.",
        reason: `${overdueProjects} project${overdueProjects > 1 ? "s are" : " is"} overdue.`,
      },
      score: 100 + overdueProjects,
    });
  }

  const overdueFollowUps = data.crm.filter((contact) => {
    const followUpDate = parseDate(contact.nextFollowUp);
    if (!followUpDate) {
      return false;
    }

    return daysFromNow(followUpDate, now) < 0;
  }).length;

  if (overdueFollowUps > 0) {
    priorities.push({
      priority: {
        moduleKey: "crm",
        severity: "critical",
        action: "Contact overdue CRM follow-ups today.",
        reason: `${overdueFollowUps} follow-up${overdueFollowUps > 1 ? "s are" : " is"} overdue.`,
      },
      score: 90 + overdueFollowUps,
    });
  }

  const overdueInvoices = data.finance.filter((entry) => {
    const type = entry.transactionType?.toLowerCase();
    const status = entry.status?.toLowerCase();
    if (type !== "income" || status !== "pending") {
      return false;
    }

    const transactionDate = parseDate(entry.date);
    if (!transactionDate) {
      return false;
    }

    return daysFromNow(transactionDate, now) < 0;
  }).length;

  if (overdueInvoices > 0) {
    priorities.push({
      priority: {
        moduleKey: "finance",
        severity: "critical",
        action: "Follow up on overdue invoices.",
        reason: `${overdueInvoices} pending invoice${overdueInvoices > 1 ? "s are" : " is"} past due.`,
      },
      score: 80 + overdueInvoices,
    });
  }

  const readyProductionTracks = data.productionMusic.filter(
    (track) => track.status?.toLowerCase() === "ready",
  ).length;

  if (readyProductionTracks > 0) {
    priorities.push({
      priority: {
        moduleKey: "production-music",
        severity: "warning",
        action: "Submit ready production music tracks.",
        reason: `${readyProductionTracks} track${readyProductionTracks > 1 ? "s are" : " is"} ready for submission.`,
      },
      score: 50 + readyProductionTracks,
    });
  }

  const draftPortfolioItems = data.portfolio.filter(
    (item) => item.status?.toLowerCase() === "draft",
  ).length;

  if (draftPortfolioItems > 0) {
    priorities.push({
      priority: {
        moduleKey: "portfolio",
        severity: "normal",
        action: "Publish a draft portfolio item.",
        reason: `${draftPortfolioItems} draft portfolio item${draftPortfolioItems > 1 ? "s are" : " is"} waiting to be published.`,
      },
      score: 20 + draftPortfolioItems,
    });
  }

  return priorities
    .sort(byScoreDescending)
    .slice(0, 6)
    .map((item) => item.priority);
}
