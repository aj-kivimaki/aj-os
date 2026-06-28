import type {
  CrmDashboardRecord,
  DashboardDatabaseLink,
  DashboardMetric,
  DashboardWidget,
} from "../types.js";

interface CrmWidgetInput {
  readonly records: readonly CrmDashboardRecord[];
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

export function buildCRMWidget(input: CrmWidgetInput): DashboardWidget {
  const now = new Date(input.generatedAtIso);

  const followUpsDue = input.records.filter((record) => {
    const date = parseDate(record.nextFollowUp);
    if (!date) {
      return false;
    }

    return daysFromNow(date, now) <= 0;
  }).length;

  const waitingReplies = input.records.filter((record) => {
    const relationshipStatus = record.relationshipStatus?.toLowerCase();
    return (
      relationshipStatus === "active" || relationshipStatus === "collaborating"
    );
  }).length;

  const staleContacts = input.records.filter((record) => {
    const date = parseDate(record.lastContact);
    if (!date) {
      return false;
    }

    return daysFromNow(date, now) < -30;
  }).length;

  const metrics: DashboardMetric[] = [
    { label: "Follow-ups Due", value: String(followUpsDue) },
    { label: "Active Relationships", value: String(waitingReplies) },
    { label: "Stale Contacts (>30d)", value: String(staleContacts) },
  ];

  const insight =
    followUpsDue > 0
      ? `${followUpsDue} contact follow-up${followUpsDue > 1 ? "s are" : " is"} currently due.`
      : "Follow-up cadence is currently under control.";

  const recommendedAction =
    followUpsDue > 0
      ? "Reach out to overdue contacts and schedule next follow-up dates."
      : staleContacts > 0
        ? "Reconnect stale contacts to keep network momentum active."
        : "Maintain weekly relationship touchpoints with active contacts.";

  return {
    moduleKey: "crm",
    title: "CRM",
    metrics,
    insight,
    recommendedAction,
    databaseLink: input.link,
  };
}
