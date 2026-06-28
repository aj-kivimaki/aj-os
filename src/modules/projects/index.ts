export {
  PROJECTS_DATABASE_KEY,
  projectRelations,
  projectsDatabaseDefinition,
  type ProjectRelation,
  type ProjectsDatabaseDefinition,
} from "./database.js";

export {
  clientProperty,
  engineOptions,
  engineProperty,
  middlewareOptions,
  middlewareProperty,
  notesProperty,
  portfolioReadyProperty,
  priorityProperty,
  projectNameProperty,
  projectPriorityOptions,
  projectProperties,
  projectStatusOptions,
  projectStatusProperty,
  projectTypeOptions,
  projectTypeProperty,
  repositoryProperty,
  startDateProperty,
  studioProperty,
  targetCompletionProperty,
  type ProjectProperty,
  type ProjectPropertyKey,
} from "./properties.js";

export {
  createProjectTemplateValues,
  defaultProjectTemplate,
  type ProjectPriority,
  type ProjectStatus,
  type ProjectTemplateDefinition,
  type ProjectTemplateValues,
  type ProjectType,
} from "./template.js";
