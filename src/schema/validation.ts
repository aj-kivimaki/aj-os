import type { DatabaseDefinition } from "./database.js";
import type { PropertyCollection } from "./database.js";

export interface ValidationIssue {
  readonly code:
    | "MISSING_DATABASE_KEY"
    | "MISSING_DATABASE_NAME"
    | "EMPTY_PROPERTIES"
    | "DUPLICATE_PROPERTY_KEY"
    | "MISSING_PRIMARY_PROPERTY"
    | "INVALID_PRIMARY_PROPERTY";
  readonly message: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

export function validateDatabaseDefinition<
  TProperties extends PropertyCollection,
>(definition: DatabaseDefinition<TProperties>): ValidationResult {
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

  const hasTitleProperty = definition.properties.some(
    (property) => property.type === "title",
  );

  if (!hasTitleProperty) {
    issues.push({
      code: "MISSING_PRIMARY_PROPERTY",
      message: "Database requires one title property.",
    });
  }

  if (
    definition.primaryPropertyKey &&
    !definition.properties.some(
      (property) => property.key === definition.primaryPropertyKey,
    )
  ) {
    issues.push({
      code: "INVALID_PRIMARY_PROPERTY",
      message: "primaryPropertyKey must match an existing property key.",
    });
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
