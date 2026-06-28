import type {
  DashboardDatabaseLink,
  DashboardMetric,
  DashboardWidget,
  GameJamsDashboardRecord,
} from "../types.js";

interface GameJamsWidgetInput {
  readonly records: readonly GameJamsDashboardRecord[];
  readonly link: DashboardDatabaseLink;
  readonly generatedAtIso: string;
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

export function buildGameJamsWidget(
  input: GameJamsWidgetInput,
): DashboardWidget {
  const now = new Date(input.generatedAtIso);

  const active = input.records.filter(
    (item) => item.status?.toLowerCase() === "active",
  ).length;
  const planned = input.records.filter(
    (item) => item.status?.toLowerCase() === "planned",
  ).length;
  const closingSoon = input.records.filter((item) => {
    const endDate = parseDate(item.endDate);
    if (!endDate) {
      return false;
    }

    const days = daysFromNow(endDate, now);
    return days >= 0 && days <= 7;
  }).length;

  const metrics: DashboardMetric[] = [
    { label: "Active", value: String(active) },
    { label: "Planned", value: String(planned) },
    { label: "Closing Soon (7d)", value: String(closingSoon) },
  ];

  const insight =
    closingSoon > 0
      ? `${closingSoon} game jam deadline${closingSoon > 1 ? "s are" : " is"} approaching this week.`
      : "No immediate game jam deadlines are approaching.";

  const recommendedAction =
    closingSoon > 0
      ? "Finalize submission scope and lock delivery tasks for active jams."
      : active > 0
        ? "Capture outcomes and convert reusable assets into future opportunities."
        : "Review upcoming jams for strategic networking opportunities.";

  return {
    moduleKey: "game-jams",
    title: "Game Jams",
    metrics,
    insight,
    recommendedAction,
    databaseLink: input.link,
  };
}
