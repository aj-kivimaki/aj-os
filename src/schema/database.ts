import type { PropertyDefinition } from "./property.js";

export type PropertyCollection = readonly PropertyDefinition[];
export type PropertyKey<TProperties extends PropertyCollection> =
  TProperties[number]["key"];

export interface DatabaseDefinition<
  TProperties extends PropertyCollection = PropertyCollection,
> {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly properties: TProperties;
  readonly primaryPropertyKey?: PropertyKey<TProperties>;
}

export function defineDatabase<TProperties extends PropertyCollection>(
  definition: DatabaseDefinition<TProperties>,
): DatabaseDefinition<TProperties> {
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
