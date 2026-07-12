import { crmDatabaseDefinition } from "./database.js";

export {
  CRM_DATABASE_KEY,
  crmDatabaseDefinition,
  type CRMDatabaseDefinition,
} from "./database.js";

export const crmModule = {
  key: crmDatabaseDefinition.key,
  displayName: "CRM",
  databaseDefinition: crmDatabaseDefinition,
} as const;

export {
  companyProperty,
  contactSourceOptions,
  contactSourceProperty,
  countryProperty,
  crmProperties,
  discordProperty,
  emailProperty,
  firstContactProperty,
  interestedInOptions,
  interestedInProperty,
  lastContactProperty,
  linkedInProperty,
  nameProperty,
  nextFollowUpProperty,
  notesProperty,
  relationshipStatusOptions,
  relationshipStatusProperty,
  roleProperty,
  websiteProperty,
  xTwitterProperty,
  type CRMProperty,
  type CRMPropertyKey,
} from "./properties.js";

export {
  createCRMTemplateValues,
  crmTemplates,
  defaultCRMTemplate,
  gameJamContactTemplate,
  referralIntroTemplate,
  type CRMTemplateDefinition,
  type CRMTemplateValues,
  type ContactSource,
  type InterestedIn,
  type RelationshipStatus,
} from "./template.js";
