import { financeDatabaseDefinition } from "./database.js";

export {
  FINANCE_DATABASE_KEY,
  financeDatabaseDefinition,
  financeRelations,
  type FinanceDatabaseDefinition,
  type FinanceRelation,
} from "./database.js";

export const financeModule = {
  key: financeDatabaseDefinition.key,
  displayName: "Finance",
  databaseDefinition: financeDatabaseDefinition,
} as const;

export {
  financeAmountProperty,
  financeCategoryOptions,
  financeCategoryProperty,
  financeCurrencyOptions,
  financeCurrencyProperty,
  financeDateProperty,
  financeDescriptionProperty,
  financeInvoiceNumberProperty,
  financeNotesProperty,
  financeProperties,
  financeRecurringProperty,
  financeStatusOptions,
  financeStatusProperty,
  financeTransactionTypeOptions,
  financeTransactionTypeProperty,
  financeVendorClientProperty,
  type FinanceProperty,
  type FinancePropertyKey,
} from "./properties.js";

export {
  clientInvoiceTemplate,
  createFinanceTemplateValues,
  equipmentPurchaseTemplate,
  financeTemplates,
  royaltyPaymentTemplate,
  softwareSubscriptionTemplate,
  travelExpenseTemplate,
  type FinanceCategory,
  type FinanceCurrency,
  type FinanceStatus,
  type FinanceTemplateDefinition,
  type FinanceTemplateValues,
  type FinanceTransactionType,
} from "./template.js";
