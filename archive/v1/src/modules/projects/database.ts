import { CRM_DATABASE_KEY } from "../crm/index.js";
import {
  defineDatabase,
  type DatabaseDefinition,
} from "../../schema/database.js";
import {
  defineRelation,
  type RelationDefinition,
} from "../../schema/relation.js";
import { projectProperties } from "./properties.js";

export const PROJECTS_DATABASE_KEY = "projects";

export const projectRelations = [
  defineRelation({
    name: "Client",
    targetDatabaseKey: CRM_DATABASE_KEY,
    type: "many_to_many",
  }),
] as const;

export const projectsDatabaseDefinition = defineDatabase({
  key: PROJECTS_DATABASE_KEY,
  name: "Projects",
  description:
    "Central database for freelance game audio work, portfolio projects, and internal experiments.",
  properties: projectProperties,
  primaryPropertyKey: "name",
  relations: projectRelations,
});

export type ProjectsDatabaseDefinition = DatabaseDefinition<
  typeof projectProperties,
  typeof projectRelations
>;

export type ProjectRelation = RelationDefinition<typeof CRM_DATABASE_KEY>;
