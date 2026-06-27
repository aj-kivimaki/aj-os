import { defineDatabase, type DatabaseDefinition } from "../../schema/database.js";
import { projectProperties } from "./properties.js";

export const PROJECTS_DATABASE_KEY = "projects";

export const projectsDatabaseDefinition = defineDatabase({
  key: PROJECTS_DATABASE_KEY,
  name: "Projects",
  description:
    "Central database for freelance game audio work, portfolio projects, and internal experiments.",
  properties: projectProperties,
  primaryPropertyKey: "name",
});

export type ProjectsDatabaseDefinition = DatabaseDefinition<
  typeof projectProperties
>;
