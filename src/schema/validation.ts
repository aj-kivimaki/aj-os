import type { DatabaseDefinition, PropertyCollection } from "./database.js";
import type { RelationCollection } from "./relation.js";

export interface ValidationIssue {
  readonly code:
    | "MISSING_DATABASE_KEY"
    | "MISSING_DATABASE_NAME"
    | "EMPTY_PROPERTIES"
    | "DUPLICATE_PROPERTY_KEY"
    | "MISSING_PRIMARY_PROPERTY"
    | "INVALID_PRIMARY_PROPERTY"
    | "MISSING_RELATION_NAME"
    | "MISSING_RELATION_TARGET_DATABASE"
    | "UNKNOWN_RELATION_TARGET_DATABASE"
    | "DUPLICATE_RELATION_NAME";
  readonly message: string;
}

export interface DatabaseValidationOptions {
  readonly hasModule?: (moduleKey: string) => boolean;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

function validatePropertyKeys(
  definition: DatabaseDefinition,
  issues: ValidationIssue[],
): void {
  const seenKeys = new Set<string>();

  for (const property of definition.properties) {
    if (seenKeys.has(property.key)) {
      issues.push({
        code: "DUPLICATE_PROPERTY_KEY",
        message: `Duplicate property key: ${property.key}`,
      });
      continue;
    }

    seenKeys.add(property.key);
  }
}

function validatePrimaryProperty(
  definition: DatabaseDefinition,
  issues: ValidationIssue[],
): void {
  const hasTitleProperty = definition.properties.some(
    (property) => property.type === "title",
  );

  if (!hasTitleProperty) {
    issues.push({
      code: "MISSING_PRIMARY_PROPERTY",
      message: "Database requires one title property.",
    });
  }

  if (!definition.primaryPropertyKey) {
    return;
  }

  const primaryPropertyExists = definition.properties.some(
    (property) => property.key === definition.primaryPropertyKey,
  );

  if (!primaryPropertyExists) {
    issues.push({
      code: "INVALID_PRIMARY_PROPERTY",
      message: "primaryPropertyKey must match an existing property key.",
    });
  }
}

function validateRelations(
  definition: DatabaseDefinition,
  issues: ValidationIssue[],
  options?: DatabaseValidationOptions,
): void {
  const seenRelationNames = new Set<string>();

  for (const relation of definition.relations ?? []) {
    const normalizedName = relation.name.trim();
    if (!normalizedName) {
      issues.push({
        code: "MISSING_RELATION_NAME",
        message: "Relation name is required.",
      });
    } else if (seenRelationNames.has(normalizedName)) {
      issues.push({
        code: "DUPLICATE_RELATION_NAME",
        message: `Duplicate relation name: ${relation.name}`,
      });
    } else {
      seenRelationNames.add(normalizedName);
    }

    if (!relation.targetDatabaseKey.trim()) {
      issues.push({
        code: "MISSING_RELATION_TARGET_DATABASE",
        message: `Relation "${relation.name}" must declare a target database key.`,
      });
      continue;
    }

    if (options?.hasModule && !options.hasModule(relation.targetDatabaseKey)) {
      issues.push({
        code: "UNKNOWN_RELATION_TARGET_DATABASE",
        message: `Relation "${relation.name}" references unknown module key "${relation.targetDatabaseKey}".`,
      });
    }
  }
}

export function validateDatabaseDefinition<
  TProperties extends PropertyCollection,
  TRelations extends RelationCollection = RelationCollection,
>(
  definition: DatabaseDefinition<TProperties, TRelations>,
  options?: DatabaseValidationOptions,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!definition.key.trim()) {
    issues.push({
      code: "MISSING_DATABASE_KEY",
      message: "Database key is required.",
    });
  }

  if (!definition.name.trim()) {
    issues.push({
      code: "MISSING_DATABASE_NAME",
      message: "Database name is required.",
    });
  }

  if (definition.properties.length === 0) {
    issues.push({
      code: "EMPTY_PROPERTIES",
      message: "Database requires at least one property.",
    });
  }

  validatePropertyKeys(definition, issues);
  validatePrimaryProperty(definition, issues);
  validateRelations(definition, issues, options);

  return {
    valid: issues.length === 0,
    issues,
  };
}
