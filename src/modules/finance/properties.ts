import { defineProperty } from "../../schema/property.js";

export const financeTransactionTypeOptions = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
] as const;

export const financeCategoryOptions = [
  { value: "client", label: "Client" },
  { value: "royalties", label: "Royalties" },
  { value: "asset_store", label: "Asset Store" },
  { value: "marketplace", label: "Marketplace" },
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "travel", label: "Travel" },
  { value: "education", label: "Education" },
  { value: "marketing", label: "Marketing" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
] as const;

export const financeStatusOptions = [
  { value: "planned", label: "Planned" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const financeCurrencyOptions = [
  { value: "eur", label: "EUR" },
  { value: "usd", label: "USD" },
  { value: "gbp", label: "GBP" },
  { value: "sek", label: "SEK" },
  { value: "nok", label: "NOK" },
] as const;

export const financeDescriptionProperty = defineProperty({
  key: "description",
  name: "Description",
  type: "title",
  description:
    "Short summary of the financial event used as the primary identifier.",
  required: true,
});

export const financeTransactionTypeProperty = defineProperty({
  key: "transactionType",
  name: "Transaction Type",
  type: "select",
  description: "Classifies the event as incoming revenue or outgoing expense.",
  required: true,
  options: financeTransactionTypeOptions,
});

export const financeCategoryProperty = defineProperty({
  key: "category",
  name: "Category",
  type: "select",
  description: "Business category used for reporting and dashboard summaries.",
  required: true,
  options: financeCategoryOptions,
});

export const financeStatusProperty = defineProperty({
  key: "status",
  name: "Status",
  type: "select",
  description: "Lifecycle state of the payment or expense event.",
  required: true,
  options: financeStatusOptions,
});

export const financeAmountProperty = defineProperty({
  key: "amount",
  name: "Amount",
  type: "number",
  description:
    "Monetary amount for the transaction before any future analytics.",
  required: true,
  number: {
    precision: 2,
    min: 0,
  },
});

export const financeCurrencyProperty = defineProperty({
  key: "currency",
  name: "Currency",
  type: "select",
  description: "Currency code associated with the transaction amount.",
  required: true,
  options: financeCurrencyOptions,
});

export const financeDateProperty = defineProperty({
  key: "date",
  name: "Date",
  type: "date",
  description:
    "Date when the financial event occurred or is expected to occur.",
  required: true,
});

export const financeVendorClientProperty = defineProperty({
  key: "vendorClient",
  name: "Vendor / Client",
  type: "text",
  description:
    "Counterparty name for the transaction, either vendor or client.",
  required: true,
});

export const financeInvoiceNumberProperty = defineProperty({
  key: "invoiceNumber",
  name: "Invoice Number",
  type: "text",
  description: "External invoice reference when available.",
});

export const financeRecurringProperty = defineProperty({
  key: "recurring",
  name: "Recurring",
  type: "checkbox",
  description: "Indicates whether this transaction repeats on a schedule.",
  required: true,
});

export const financeNotesProperty = defineProperty({
  key: "notes",
  name: "Notes",
  type: "text",
  description: "Additional context, terms, and operational finance notes.",
  multiline: true,
});

export const financeProperties = [
  financeDescriptionProperty,
  financeTransactionTypeProperty,
  financeCategoryProperty,
  financeStatusProperty,
  financeAmountProperty,
  financeCurrencyProperty,
  financeDateProperty,
  financeVendorClientProperty,
  financeInvoiceNumberProperty,
  financeRecurringProperty,
  financeNotesProperty,
] as const;

export type FinanceProperty = (typeof financeProperties)[number];
export type FinancePropertyKey = FinanceProperty["key"];
