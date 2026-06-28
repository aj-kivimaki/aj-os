import type { PropertyDefinition } from "./property.js";
import type {
  RelationCollection,
  RelationDefinition,
  RelationName,
} from "./relation.js";

export type PropertyCollection = readonly PropertyDefinition[];
export type PropertyKey<TProperties extends PropertyCollection> =
  TProperties[number]["key"];

export interface DatabaseDefinition<
  TProperties extends PropertyCollection = PropertyCollection,
  TRelations extends RelationCollection = RelationCollection,
> {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly properties: TProperties;
  readonly primaryPropertyKey?: PropertyKey<TProperties>;
  readonly relations?: TRelations;
}

export function defineDatabase<
  TProperties extends PropertyCollection,
  TRelations extends RelationCollection = RelationCollection,
>(
  definition: DatabaseDefinition<TProperties, TRelations>,
): DatabaseDefinition<TProperties, TRelations> {
  return definition;
}

export function getPropertyByKey<
  TProperties extends PropertyCollection,
  TKey extends PropertyKey<TProperties>,
>(
  definition: DatabaseDefinition<TProperties>,
  key: TKey,
): Extract<TProperties[number], { key: TKey }> | undefined {
  const property = definition.properties.find((item) => item.key === key);
  return property as Extract<TProperties[number], { key: TKey }> | undefined;
}

export function getRelationByName<
  TRelations extends RelationCollection,
  TName extends RelationName<TRelations>,
>(
  definition: DatabaseDefinition<PropertyCollection, TRelations>,
  name: TName,
): Extract<TRelations[number], { name: TName }> | undefined {
  const relation = definition.relations?.find((item) => item.name === name);
  return relation as Extract<TRelations[number], { name: TName }> | undefined;
}
