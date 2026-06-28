import { productionMusicDatabaseDefinition } from "./database.js";

export {
  PRODUCTION_MUSIC_DATABASE_KEY,
  productionMusicDatabaseDefinition,
  productionMusicRelations,
  type ProductionMusicDatabaseDefinition,
  type ProductionMusicRelation,
} from "./database.js";

export const productionMusicModule = {
  key: productionMusicDatabaseDefinition.key,
  displayName: "Production Music",
  databaseDefinition: productionMusicDatabaseDefinition,
} as const;

export {
  productionMusicBpmProperty,
  productionMusicDurationProperty,
  productionMusicGenreOptions,
  productionMusicGenreProperty,
  productionMusicKeyProperty,
  productionMusicLibraryProperty,
  productionMusicMoodOptions,
  productionMusicMoodProperty,
  productionMusicNotesProperty,
  productionMusicProperties,
  productionMusicPublishedProperty,
  productionMusicStatusOptions,
  productionMusicStatusProperty,
  productionMusicTitleProperty,
  type ProductionMusicProperty,
  type ProductionMusicPropertyKey,
} from "./properties.js";

export {
  ambientTemplate,
  cinematicCueTemplate,
  createProductionMusicTemplateValues,
  horrorTemplate,
  hybridActionTemplate,
  productionMusicAlbumTrackTemplate,
  productionMusicTemplates,
  type ProductionMusicGenre,
  type ProductionMusicMood,
  type ProductionMusicStatus,
  type ProductionMusicTemplateDefinition,
  type ProductionMusicTemplateValues,
} from "./template.js";
