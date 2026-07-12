import { PROJECTS_DATABASE_KEY } from "../projects/index.js";
import {
  defineDatabase,
  type DatabaseDefinition,
} from "../../schema/database.js";
import {
  defineRelation,
  type RelationDefinition,
} from "../../schema/relation.js";
import { portfolioProperties } from "./properties.js";

export const PORTFOLIO_DATABASE_KEY = "portfolio";

export const portfolioRelations = [
  defineRelation({
    name: "Project",
    targetDatabaseKey: PROJECTS_DATABASE_KEY,
    type: "one_to_many",
  }),
] as const;

export const portfolioDatabaseDefinition = defineDatabase({
  key: PORTFOLIO_DATABASE_KEY,
  name: "Portfolio",
  description:
    "Public showcase database for selected work linked to core projects.",
  properties: portfolioProperties,
  primaryPropertyKey: "title",
  relations: portfolioRelations,
});

export type PortfolioDatabaseDefinition = DatabaseDefinition<
  typeof portfolioProperties,
  typeof portfolioRelations
>;

export type PortfolioRelation = RelationDefinition<
  typeof PROJECTS_DATABASE_KEY
>;
