import type { DatabaseDefinition, PropertyCollection } from "./database.js";
import {
  validateDatabaseDefinition,
  type DatabaseValidationOptions,
} from "./validation.js";

export interface DatabaseBuildPlan {
  readonly databaseKey: string;
  readonly databaseName: string;
  readonly propertyCount: number;
  readonly metadata: {
    readonly description?: string;
    readonly primaryPropertyKey?: string;
  };
}

export interface BuildTranslator<TOutput> {
  toOutput(plan: DatabaseBuildPlan): TOutput;
}

export class DatabaseBuilder<TOutput = DatabaseBuildPlan> {
  public constructor(private readonly translator?: BuildTranslator<TOutput>) {}

  public build<TProperties extends PropertyCollection>(
    definition: DatabaseDefinition<TProperties>,
    validationOptions?: DatabaseValidationOptions,
  ): TOutput {
    const validation = validateDatabaseDefinition(
      definition,
      validationOptions,
    );
    if (!validation.valid) {
      const issueText = validation.issues
        .map((issue) => `- ${issue.code}: ${issue.message}`)
        .join("\n");

      throw new Error(
        `Schema validation failed for database "${definition.key}":\n${issueText}`,
      );
    }

    const metadata: DatabaseBuildPlan["metadata"] = {
      ...(definition.description
        ? { description: definition.description }
        : {}),
      ...(definition.primaryPropertyKey
        ? { primaryPropertyKey: definition.primaryPropertyKey }
        : {}),
    };

    const plan: DatabaseBuildPlan = {
      databaseKey: definition.key,
      databaseName: definition.name,
      propertyCount: definition.properties.length,
      metadata,
    };

    if (this.translator) {
      return this.translator.toOutput(plan);
    }

    return plan as TOutput;
  }
}
