import type {
  DashboardBusinessHealth,
  DashboardExecutiveSummary,
  DashboardPriority,
} from "../types.js";

interface ExecutiveSummaryInput {
  readonly businessHealth: DashboardBusinessHealth;
  readonly activeProjects: number;
  readonly monthlyBalance: number;
  readonly priorities: readonly DashboardPriority[];
}

export function buildExecutiveSummary(
  input: ExecutiveSummaryInput,
): DashboardExecutiveSummary {
  const criticalPriorities = input.priorities.filter(
    (item) => item.severity === "critical",
  ).length;

  const immediateRisks = input.priorities
    .filter((item) => item.severity !== "normal")
    .slice(0, 3)
    .map((item) => item.reason);

  return {
    businessHealth: input.businessHealth,
    activeProjects: input.activeProjects,
    currentPriorities: input.priorities.length,
    financialSnapshot:
      input.monthlyBalance >= 0
        ? `Monthly balance is positive (${input.monthlyBalance.toFixed(2)}).`
        : `Monthly balance is negative (${input.monthlyBalance.toFixed(2)}).`,
    immediateRisks:
      immediateRisks.length > 0
        ? immediateRisks
        : criticalPriorities > 0
          ? ["Critical priorities require immediate action."]
          : ["No immediate high-severity risks detected."],
  };
}
