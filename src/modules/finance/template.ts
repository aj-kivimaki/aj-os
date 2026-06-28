import {
  financeCategoryOptions,
  financeCurrencyOptions,
  financeStatusOptions,
  financeTransactionTypeOptions,
} from "./properties.js";

type OptionValue<TOptions extends readonly { readonly value: string }[]> =
  TOptions[number]["value"];

export type FinanceTransactionType = OptionValue<
  typeof financeTransactionTypeOptions
>;
export type FinanceCategory = OptionValue<typeof financeCategoryOptions>;
export type FinanceStatus = OptionValue<typeof financeStatusOptions>;
export type FinanceCurrency = OptionValue<typeof financeCurrencyOptions>;

export interface FinanceTemplateValues {
  readonly transactionType: FinanceTransactionType;
  readonly category: FinanceCategory;
  readonly status: FinanceStatus;
  readonly amount: number;
  readonly currency: FinanceCurrency;
  readonly recurring: boolean;
}

export interface FinanceTemplateDefinition {
  readonly key:
    | "client-invoice"
    | "software-subscription"
    | "equipment-purchase"
    | "travel-expense"
    | "royalty-payment";
  readonly name:
    | "Client Invoice"
    | "Software Subscription"
    | "Equipment Purchase"
    | "Travel Expense"
    | "Royalty Payment";
  readonly description: string;
  readonly defaults: FinanceTemplateValues;
}

export const clientInvoiceTemplate: FinanceTemplateDefinition = {
  key: "client-invoice",
  name: "Client Invoice",
  description:
    "Template for outgoing client invoices tracked from issue to payment.",
  defaults: {
    transactionType: "income",
    category: "client",
    status: "pending",
    amount: 0,
    currency: "eur",
    recurring: false,
  },
};

export const softwareSubscriptionTemplate: FinanceTemplateDefinition = {
  key: "software-subscription",
  name: "Software Subscription",
  description:
    "Template for recurring software tooling costs such as plugins and SaaS services.",
  defaults: {
    transactionType: "expense",
    category: "software",
    status: "planned",
    amount: 0,
    currency: "eur",
    recurring: true,
  },
};

export const equipmentPurchaseTemplate: FinanceTemplateDefinition = {
  key: "equipment-purchase",
  name: "Equipment Purchase",
  description:
    "Template for one-time hardware and studio equipment investments.",
  defaults: {
    transactionType: "expense",
    category: "hardware",
    status: "planned",
    amount: 0,
    currency: "eur",
    recurring: false,
  },
};

export const travelExpenseTemplate: FinanceTemplateDefinition = {
  key: "travel-expense",
  name: "Travel Expense",
  description:
    "Template for travel-related costs such as events, conferences, and client visits.",
  defaults: {
    transactionType: "expense",
    category: "travel",
    status: "planned",
    amount: 0,
    currency: "eur",
    recurring: false,
  },
};

export const royaltyPaymentTemplate: FinanceTemplateDefinition = {
  key: "royalty-payment",
  name: "Royalty Payment",
  description:
    "Template for royalty income events from production music and licensing channels.",
  defaults: {
    transactionType: "income",
    category: "royalties",
    status: "pending",
    amount: 0,
    currency: "eur",
    recurring: false,
  },
};

export const financeTemplates = [
  clientInvoiceTemplate,
  softwareSubscriptionTemplate,
  equipmentPurchaseTemplate,
  travelExpenseTemplate,
  royaltyPaymentTemplate,
] as const;

export function createFinanceTemplateValues(
  overrides: Partial<FinanceTemplateValues> = {},
  template: FinanceTemplateDefinition = clientInvoiceTemplate,
): FinanceTemplateValues {
  return {
    ...template.defaults,
    ...overrides,
  };
}
