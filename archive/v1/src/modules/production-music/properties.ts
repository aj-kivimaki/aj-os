import { defineProperty } from "../../schema/property.js";

export const productionMusicStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "ready", label: "Ready" },
  { value: "submitted", label: "Submitted" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

export const productionMusicGenreOptions = [
  { value: "cinematic", label: "Cinematic" },
  { value: "hybrid", label: "Hybrid" },
  { value: "rock", label: "Rock" },
  { value: "electronic", label: "Electronic" },
  { value: "ambient", label: "Ambient" },
  { value: "horror", label: "Horror" },
  { value: "orchestral", label: "Orchestral" },
  { value: "action", label: "Action" },
  { value: "adventure", label: "Adventure" },
] as const;

export const productionMusicMoodOptions = [
  { value: "epic", label: "Epic" },
  { value: "emotional", label: "Emotional" },
  { value: "dark", label: "Dark" },
  { value: "hopeful", label: "Hopeful" },
  { value: "aggressive", label: "Aggressive" },
  { value: "suspense", label: "Suspense" },
  { value: "relaxed", label: "Relaxed" },
  { value: "tense", label: "Tense" },
  { value: "mysterious", label: "Mysterious" },
] as const;

export const productionMusicTitleProperty = defineProperty({
  key: "title",
  name: "Title",
  type: "title",
  description: "Cue title used as the primary identifier for licensing work.",
  required: true,
});

export const productionMusicStatusProperty = defineProperty({
  key: "status",
  name: "Status",
  type: "select",
  description: "Lifecycle stage from ideation to published catalog entry.",
  required: true,
  options: productionMusicStatusOptions,
});

export const productionMusicGenreProperty = defineProperty({
  key: "genre",
  name: "Genre",
  type: "select",
  description: "Primary stylistic category for search and library targeting.",
  required: true,
  options: productionMusicGenreOptions,
});

export const productionMusicMoodProperty = defineProperty({
  key: "mood",
  name: "Mood",
  type: "multi_select",
  description:
    "Emotional tone descriptors used for creative and client briefs.",
  required: true,
  options: productionMusicMoodOptions,
});

export const productionMusicDurationProperty = defineProperty({
  key: "duration",
  name: "Duration",
  type: "text",
  description: "Cue duration in mm:ss format, for example 02:34.",
  required: true,
});

export const productionMusicBpmProperty = defineProperty({
  key: "bpm",
  name: "BPM",
  type: "number",
  description: "Tempo used for arrangement consistency and search filtering.",
  required: true,
  number: {
    precision: 0,
    min: 20,
    max: 300,
  },
});

export const productionMusicKeyProperty = defineProperty({
  key: "musicKey",
  name: "Key",
  type: "text",
  description: "Musical key signature, for example D minor or C major.",
  required: true,
});

export const productionMusicLibraryProperty = defineProperty({
  key: "library",
  name: "Library",
  type: "text",
  description: "Target or accepted production music library for submissions.",
  required: true,
});

export const productionMusicPublishedProperty = defineProperty({
  key: "published",
  name: "Published",
  type: "checkbox",
  description: "Indicates whether the cue is currently released to a library.",
  required: true,
});

export const productionMusicNotesProperty = defineProperty({
  key: "notes",
  name: "Notes",
  type: "text",
  description: "Creative notes, submission context, and licensing remarks.",
  multiline: true,
});

export const productionMusicProperties = [
  productionMusicTitleProperty,
  productionMusicStatusProperty,
  productionMusicGenreProperty,
  productionMusicMoodProperty,
  productionMusicDurationProperty,
  productionMusicBpmProperty,
  productionMusicKeyProperty,
  productionMusicLibraryProperty,
  productionMusicPublishedProperty,
  productionMusicNotesProperty,
] as const;

export type ProductionMusicProperty =
  (typeof productionMusicProperties)[number];
export type ProductionMusicPropertyKey = ProductionMusicProperty["key"];
