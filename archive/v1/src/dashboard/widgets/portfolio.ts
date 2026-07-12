import type {
  DashboardDatabaseLink,
  DashboardMetric,
  DashboardWidget,
  PortfolioDashboardRecord,
} from "../types.js";

interface PortfolioWidgetInput {
  readonly records: readonly PortfolioDashboardRecord[];
  readonly link: DashboardDatabaseLink;
}

export function buildPortfolioWidget(
  input: PortfolioWidgetInput,
): DashboardWidget {
  const published = input.records.filter(
    (item) => item.status?.toLowerCase() === "published",
  ).length;
  const featured = input.records.filter(
    (item) => item.featured === true,
  ).length;
  const draft = input.records.filter(
    (item) => item.status?.toLowerCase() === "draft",
  ).length;

  const metrics: DashboardMetric[] = [
    { label: "Published", value: String(published) },
    { label: "Featured", value: String(featured) },
    { label: "Draft", value: String(draft) },
  ];

  const insight =
    draft > 0
      ? `${draft} portfolio draft${draft > 1 ? "s are" : " is"} ready to be turned into public proof of work.`
      : "Portfolio publication pipeline is up to date.";

  const recommendedAction =
    draft > 0
      ? "Publish one draft portfolio item to maintain visibility."
      : "Refresh featured portfolio positioning to highlight strongest work.";

  return {
    moduleKey: "portfolio",
    title: "Portfolio",
    metrics,
    insight,
    recommendedAction,
    databaseLink: input.link,
  };
}
