import { gameJamsDatabaseDefinition } from "./database.js";

export {
  GAME_JAMS_DATABASE_KEY,
  gameJamsDatabaseDefinition,
  gameJamRelations,
  type GameJamRelation,
  type GameJamsDatabaseDefinition,
} from "./database.js";

export const gameJamsModule = {
  key: gameJamsDatabaseDefinition.key,
  displayName: "Game Jams",
  databaseDefinition: gameJamsDatabaseDefinition,
} as const;

export {
  gameJamEndDateProperty,
  gameJamEventProperty,
  gameJamNameProperty,
  gameJamNotesProperty,
  gameJamProperties,
  gameJamResultProperty,
  gameJamRoleOptions,
  gameJamRoleProperty,
  gameJamStartDateProperty,
  gameJamStatusOptions,
  gameJamStatusProperty,
  gameJamTeamSizeProperty,
  gameJamThemeProperty,
  type GameJamProperty,
  type GameJamPropertyKey,
} from "./properties.js";

export {
  createGameJamTemplateValues,
  gameJamTemplates,
  onlineJamTemplate,
  soloJamTemplate,
  teamJamTemplate,
  weekendJamTemplate,
  type GameJamRole,
  type GameJamStatus,
  type GameJamTemplateDefinition,
  type GameJamTemplateValues,
} from "./template.js";
