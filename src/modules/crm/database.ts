import {
  defineDatabase,
  type DatabaseDefinition,
} from "../../schema/database.js";
import { crmProperties } from "./properties.js";

export const CRM_DATABASE_KEY = "crm";

export const crmDatabaseDefinition = defineDatabase({
  key: CRM_DATABASE_KEY,
  name: "CRM",
  description:
    "Relationship-first CRM for long-term game audio networking, collaboration, and follow-up.",
  properties: crmProperties,
  primaryPropertyKey: "name",
});

export type CRMDatabaseDefinition = DatabaseDefinition<typeof crmProperties>;
