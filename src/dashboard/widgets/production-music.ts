import type {
  DashboardDatabaseLink,
  DashboardMetric,
  DashboardWidget,
  ProductionMusicDashboardRecord,
} from "../types.js";

interface ProductionMusicWidgetInput {
  readonly records: readonly ProductionMusicDashboardRecord[];
  readonly link: DashboardDatabaseLink;
}

export function buildProductionMusicWidget(
  input: ProductionMusicWidgetInput,
): DashboardWidget {
  const draft = input.records.filter(
    (item) => item.status?.toLowerCase() === "draft",
  ).length;
  const ready = input.records.filter(
    (item) => item.status?.toLowerCase() === "ready",
  ).length;
  const submitted = input.records.filter(
    (item) => item.status?.toLowerCase() === "submitted",
  ).length;
  const published = input.records.filter(
    (item) => item.published === true,
  ).length;

  const metrics: DashboardMetric[] = [
    { label: "Draft", value: String(draft) },
    { label: "Ready", value: String(ready) },
    { label: "Submitted", value: String(submitted) },
    { label: "Published", value: String(published) },
  ];

  const insight =
    ready > 0
      ? `${ready} track${ready > 1 ? "s are" : " is"} ready for submission to libraries.`
      : "No tracks are currently marked as ready for submission.";

  const recommendedAction =
    ready > 0
      ? "Package and submit ready tracks to target libraries this week."
      : draft > 0
        ? "Move draft tracks to ready status with a focused finishing session."
        : "Plan the next cue production cycle to keep catalog growth active.";

  return {
    moduleKey: "production-music",
    title: "Production Music",
    metrics,
    insight,
    recommendedAction,
    databaseLink: input.link,
  };
}
