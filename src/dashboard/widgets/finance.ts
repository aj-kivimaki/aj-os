import type {
  DashboardDatabaseLink,
  DashboardMetric,
  DashboardWidget,
  FinanceDashboardRecord,
} from "../types.js";

interface FinanceWidgetInput {
  readonly records: readonly FinanceDashboardRecord[];
  readonly link: DashboardDatabaseLink;
  readonly generatedAtIso: string;
}

interface FinanceSnapshot {
  readonly income: number;
  readonly expenses: number;
  readonly outstandingInvoices: number;
  readonly monthlyBalance: number;
}

function parseDate(dateIso: string | undefined): Date | null {
  if (!dateIso) {
    return null;
  }

  const value = new Date(dateIso);
  return Number.isNaN(value.getTime()) ? null : value;
}

function buildFinanceSnapshot(input: FinanceWidgetInput): FinanceSnapshot {
  const now = new Date(input.generatedAtIso);
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();

  let income = 0;
  let expenses = 0;
  let outstandingInvoices = 0;

  for (const item of input.records) {
    const amount = item.amount ?? 0;
    const type = item.transactionType?.toLowerCase();
    const status = item.status?.toLowerCase();
    const date = parseDate(item.date);

    const isCurrentMonth =
      date !== null &&
      date.getUTCMonth() === month &&
      date.getUTCFullYear() === year;

    if (type === "income" && status === "pending") {
      outstandingInvoices += 1;
    }

    if (!isCurrentMonth || status !== "paid") {
      continue;
    }

    if (type === "income") {
      income += amount;
      continue;
    }

    if (type === "expense") {
      expenses += amount;
    }
  }

  return {
    income,
    expenses,
    outstandingInvoices,
    monthlyBalance: income - expenses,
  };
}

export function buildFinanceWidget(input: FinanceWidgetInput): {
  readonly widget: DashboardWidget;
  readonly monthlyBalance: number;
} {
  const snapshot = buildFinanceSnapshot(input);

  const metrics: DashboardMetric[] = [
    { label: "Income (Month)", value: snapshot.income.toFixed(2) },
    { label: "Expenses (Month)", value: snapshot.expenses.toFixed(2) },
    {
      label: "Outstanding Invoices",
      value: String(snapshot.outstandingInvoices),
    },
  ];

  const insight =
    snapshot.monthlyBalance >= 0
      ? `Cash flow is positive this month (${snapshot.monthlyBalance.toFixed(2)}).`
      : `Cash flow is negative this month (${snapshot.monthlyBalance.toFixed(2)}).`;

  const recommendedAction =
    snapshot.outstandingInvoices > 0
      ? "Follow up outstanding invoices and protect short-term cash flow."
      : snapshot.monthlyBalance < 0
        ? "Prioritize revenue actions and pause non-essential expenses."
        : "Keep revenue momentum and maintain disciplined spending.";

  return {
    widget: {
      moduleKey: "finance",
      title: "Finance",
      metrics,
      insight,
      recommendedAction,
      databaseLink: input.link,
    },
    monthlyBalance: snapshot.monthlyBalance,
  };
}
