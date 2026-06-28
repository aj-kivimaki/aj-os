export {
  defineDatabase,
  getRelationByName,
  getPropertyByKey,
  type DatabaseDefinition,
  type PropertyCollection,
  type PropertyKey,
} from "./database.js";
export {
  DatabaseBuilder,
  type BuildTranslator,
  type DatabaseBuildPlan,
} from "./builder.js";
export {
  defineProperty,
  type PropertyDefinition,
  type PropertyType,
} from "./property.js";
export {
  defineRelation,
  type RelationCollection,
  type RelationDefinition,
  type RelationName,
  type RelationType,
} from "./relation.js";
export {
  validateDatabaseDefinition,
  type ValidationIssue,
  type ValidationResult,
} from "./validation.js";
