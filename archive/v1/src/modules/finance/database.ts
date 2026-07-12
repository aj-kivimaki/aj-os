import { PROJECTS_DATABASE_KEY } from "../projects/index.js";
import {
  defineDatabase,
  type DatabaseDefinition,
} from "../../schema/database.js";
import {
  defineRelation,
  type RelationDefinition,
} from "../../schema/relation.js";
import { financeProperties } from "./properties.js";

export const FINANCE_DATABASE_KEY = "finance";

export const financeRelations = [
  defineRelation({
    name: "Project",
    targetDatabaseKey: PROJECTS_DATABASE_KEY,
    type: "one_to_many",
  }),
] as const;

export const financeDatabaseDefinition = defineDatabase({
  key: FINANCE_DATABASE_KEY,
  name: "Finance",
  description:
    "Business-event ledger for income and expenses across projects, subscriptions, royalties, and operations.",
  properties: financeProperties,
  primaryPropertyKey: "description",
  relations: financeRelations,
});

export type FinanceDatabaseDefinition = DatabaseDefinition<
  typeof financeProperties,
  typeof financeRelations
>;

export type FinanceRelation = RelationDefinition<typeof PROJECTS_DATABASE_KEY>;
