import { PROJECTS_DATABASE_KEY } from "../projects/index.js";
import {
  defineDatabase,
  type DatabaseDefinition,
} from "../../schema/database.js";
import {
  defineRelation,
  type RelationDefinition,
} from "../../schema/relation.js";
import { gameJamProperties } from "./properties.js";

export const GAME_JAMS_DATABASE_KEY = "game-jams";

export const gameJamRelations = [
  defineRelation({
    name: "Project",
    targetDatabaseKey: PROJECTS_DATABASE_KEY,
    type: "one_to_many",
  }),
] as const;

export const gameJamsDatabaseDefinition = defineDatabase({
  key: GAME_JAMS_DATABASE_KEY,
  name: "Game Jams",
  description:
    "Collaborative rapid-development projects used for networking, portfolio growth, and experimentation.",
  properties: gameJamProperties,
  primaryPropertyKey: "name",
  relations: gameJamRelations,
});

export type GameJamsDatabaseDefinition = DatabaseDefinition<
  typeof gameJamProperties,
  typeof gameJamRelations
>;

export type GameJamRelation = RelationDefinition<typeof PROJECTS_DATABASE_KEY>;
