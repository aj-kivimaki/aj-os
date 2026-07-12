import { PORTFOLIO_DATABASE_KEY } from "../portfolio/index.js";
import {
  defineDatabase,
  type DatabaseDefinition,
} from "../../schema/database.js";
import {
  defineRelation,
  type RelationDefinition,
} from "../../schema/relation.js";
import { productionMusicProperties } from "./properties.js";

export const PRODUCTION_MUSIC_DATABASE_KEY = "production-music";

export const productionMusicRelations = [
  defineRelation({
    name: "Portfolio",
    targetDatabaseKey: PORTFOLIO_DATABASE_KEY,
    type: "one_to_many",
  }),
] as const;

export const productionMusicDatabaseDefinition = defineDatabase({
  key: PRODUCTION_MUSIC_DATABASE_KEY,
  name: "Production Music",
  description:
    "Licensable production music cue catalog for submissions, release readiness, and long-term asset growth.",
  properties: productionMusicProperties,
  primaryPropertyKey: "title",
  relations: productionMusicRelations,
});

export type ProductionMusicDatabaseDefinition = DatabaseDefinition<
  typeof productionMusicProperties,
  typeof productionMusicRelations
>;

export type ProductionMusicRelation = RelationDefinition<
  typeof PORTFOLIO_DATABASE_KEY
>;
