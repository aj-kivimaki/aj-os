export type RelationType = "one_to_one" | "one_to_many" | "many_to_many";

export interface RelationDefinition<TTargetDatabaseKey extends string = string> {
  readonly name: string;
  readonly targetDatabaseKey: TTargetDatabaseKey;
  readonly type: RelationType;
}

export type RelationCollection = readonly RelationDefinition[];
export type RelationName<TRelations extends RelationCollection> =
  TRelations[number]["name"];

export function defineRelation<TTargetDatabaseKey extends string>(
  definition: RelationDefinition<TTargetDatabaseKey>,
): RelationDefinition<TTargetDatabaseKey> {
  return definition;
}