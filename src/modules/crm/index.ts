export {
  CRM_DATABASE_KEY,
  crmDatabaseDefinition,
  type CRMDatabaseDefinition,
} from "./database.js";

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
