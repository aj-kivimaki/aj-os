import { defineProperty } from "../../schema/property.js";

export const gameJamStatusOptions = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;

export const gameJamRoleOptions = [
  { value: "audio", label: "Audio" },
  { value: "composer", label: "Composer" },
  { value: "sound_designer", label: "Sound Designer" },
  { value: "programmer", label: "Programmer" },
  { value: "designer", label: "Designer" },
  { value: "artist", label: "Artist" },
  { value: "generalist", label: "Generalist" },
] as const;

export const gameJamNameProperty = defineProperty({
  key: "name",
  name: "Name",
  type: "title",
  description: "Primary name of the game jam entry.",
  required: true,
});

export const gameJamEventProperty = defineProperty({
  key: "event",
  name: "Event",
  type: "text",
  description: "Host event or platform running the jam.",
  required: true,
});

export const gameJamStatusProperty = defineProperty({
  key: "status",
  name: "Status",
  type: "select",
  description: "Current lifecycle status of the game jam project.",
  required: true,
  options: gameJamStatusOptions,
});

export const gameJamThemeProperty = defineProperty({
  key: "theme",
  name: "Theme",
  type: "text",
  description: "Official or interpreted theme for the jam.",
  required: true,
});

export const gameJamStartDateProperty = defineProperty({
  key: "startDate",
  name: "Start Date",
  type: "date",
  description: "Jam start date used for planning and execution.",
  required: true,
});

export const gameJamEndDateProperty = defineProperty({
  key: "endDate",
  name: "End Date",
  type: "date",
  description: "Jam end or submission deadline date.",
  required: true,
});

export const gameJamTeamSizeProperty = defineProperty({
  key: "teamSize",
  name: "Team Size",
  type: "number",
  description: "Number of active contributors in the jam team.",
  required: true,
  number: {
    precision: 0,
    min: 1,
  },
});

export const gameJamRoleProperty = defineProperty({
  key: "role",
  name: "Role",
  type: "select",
  description: "Primary role handled during the jam.",
  required: true,
  options: gameJamRoleOptions,
});

export const gameJamResultProperty = defineProperty({
  key: "result",
  name: "Result",
  type: "text",
  description: "Outcome summary such as rankings or mentions.",
  required: true,
});

export const gameJamNotesProperty = defineProperty({
  key: "notes",
  name: "Notes",
  type: "text",
  description: "Retrospective notes, collaboration learnings, and follow-ups.",
  required: true,
  multiline: true,
});

export const gameJamProperties = [
  gameJamNameProperty,
  gameJamEventProperty,
  gameJamStatusProperty,
  gameJamThemeProperty,
  gameJamStartDateProperty,
  gameJamEndDateProperty,
  gameJamTeamSizeProperty,
  gameJamRoleProperty,
  gameJamResultProperty,
  gameJamNotesProperty,
] as const;

export type GameJamProperty = (typeof gameJamProperties)[number];
export type GameJamPropertyKey = GameJamProperty["key"];
