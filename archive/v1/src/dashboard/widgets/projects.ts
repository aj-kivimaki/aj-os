import type {
  DashboardDatabaseLink,
  DashboardMetric,
  DashboardWidget,
  ProjectDashboardRecord,
} from "../types.js";

interface ProjectsWidgetInput {
  readonly records: readonly ProjectDashboardRecord[];
  readonly link: DashboardDatabaseLink;
  readonly generatedAtIso: string;
}

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

export function buildProjectsWidget(
  input: ProjectsWidgetInput,
): DashboardWidget {
  const now = new Date(input.generatedAtIso);
  const activeStatuses = new Set([
    "active",
    "scoping",
    "inquiry",
    "waiting_feedback",
  ]);
  const blockedStatuses = new Set(["on_hold", "waiting_feedback"]);

  const activeProjects = input.records.filter((item) =>
    activeStatuses.has(item.status?.toLowerCase() ?? ""),
  ).length;
  const blockedProjects = input.records.filter((item) =>
    blockedStatuses.has(item.status?.toLowerCase() ?? ""),
  ).length;

  const overdueProjects = input.records.filter((item) => {
    const status = item.status?.toLowerCase() ?? "";
    if (!activeStatuses.has(status)) {
      return false;
    }

    const targetCompletion = parseDate(item.targetCompletion);
    if (!targetCompletion) {
      return false;
    }

    return daysFromNow(targetCompletion, now) < 0;
  }).length;

  const upcomingDeadlines = input.records.filter((item) => {
    const status = item.status?.toLowerCase() ?? "";
    if (!activeStatuses.has(status)) {
      return false;
    }

    const targetCompletion = parseDate(item.targetCompletion);
    if (!targetCompletion) {
      return false;
    }

    const days = daysFromNow(targetCompletion, now);
    return days >= 0 && days <= 7;
  }).length;

  const metrics: DashboardMetric[] = [
    { label: "Active Projects", value: String(activeProjects) },
    { label: "Upcoming Deadlines (7d)", value: String(upcomingDeadlines) },
    { label: "Blocked", value: String(blockedProjects) },
  ];

  const insight =
    overdueProjects > 0
      ? `${overdueProjects} project${overdueProjects > 1 ? "s are" : " is"} overdue and requires immediate intervention.`
      : upcomingDeadlines > 0
        ? `${upcomingDeadlines} project milestone${upcomingDeadlines > 1 ? "s are" : " is"} approaching within one week.`
        : "Project execution is currently stable with no overdue milestones.";

  const recommendedAction =
    overdueProjects > 0
      ? "Unblock overdue projects and commit next delivery milestones today."
      : blockedProjects > 0
        ? "Resolve blockers or waiting-feedback dependencies to regain flow."
        : "Protect focus time for active projects and keep delivery cadence.";

  return {
    moduleKey: "projects",
    title: "Projects",
    metrics,
    insight,
    recommendedAction,
    databaseLink: input.link,
  };
}
