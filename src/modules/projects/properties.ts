import { defineProperty } from "../../schema/property.js";

export const projectStatusOptions = [
  { value: "backlog", label: "Backlog" },
  { value: "inquiry", label: "Inquiry" },
  { value: "scoping", label: "Scoping" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "waiting_feedback", label: "Waiting Feedback" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const projectTypeOptions = [
  { value: "freelance_game", label: "Freelance Game" },
  { value: "portfolio_piece", label: "Portfolio Piece" },
  { value: "audio_redesign", label: "Audio Redesign" },
  { value: "technical_demo", label: "Technical Demo" },
  { value: "internal_experiment", label: "Internal Experiment" },
  { value: "game_jam", label: "Game Jam" },
] as const;

export const engineOptions = [
  { value: "unity", label: "Unity" },
  { value: "unreal", label: "Unreal" },
  { value: "godot", label: "Godot" },
  { value: "custom", label: "Custom" },
  { value: "unknown", label: "Unknown" },
] as const;

export const middlewareOptions = [
  { value: "wwise", label: "Wwise" },
  { value: "fmod", label: "FMOD" },
  { value: "native_audio", label: "Native Audio" },
  { value: "none", label: "None" },
] as const;

export const projectPriorityOptions = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

export const projectNameProperty = defineProperty({
  key: "name",
  name: "Name",
  type: "title",
  description: "Project name used as the primary identifier.",
  required: true,
});

export const projectStatusProperty = defineProperty({
  key: "status",
  name: "Status",
  type: "select",
  description: "Current production state for planning and tracking.",
  required: true,
  options: projectStatusOptions,
});

export const projectTypeProperty = defineProperty({
  key: "projectType",
  name: "Project Type",
  type: "select",
  description: "Business category of the project.",
  required: true,
  options: projectTypeOptions,
});

export const clientProperty = defineProperty({
  key: "client",
  name: "Client",
  type: "text",
  description: "Primary commissioning contact or client name.",
});

export const studioProperty = defineProperty({
  key: "studio",
  name: "Studio",
  type: "text",
  description: "Associated studio, team, or organization.",
});

export const startDateProperty = defineProperty({
  key: "startDate",
  name: "Start Date",
  type: "date",
  description: "Planned or actual project start date.",
});

export const targetCompletionProperty = defineProperty({
  key: "targetCompletion",
  name: "Target Completion",
  type: "date",
  description: "Planned delivery milestone or completion date.",
});

export const engineProperty = defineProperty({
  key: "engine",
  name: "Engine",
  type: "select",
  description: "Primary game engine or runtime platform.",
  options: engineOptions,
});

export const middlewareProperty = defineProperty({
  key: "middleware",
  name: "Middleware",
  type: "multi_select",
  description: "Audio middleware or implementation stack.",
  options: middlewareOptions,
});

export const repositoryProperty = defineProperty({
  key: "repository",
  name: "Repository",
  type: "url",
  description: "Version control repository URL.",
});

export const portfolioReadyProperty = defineProperty({
  key: "portfolioReady",
  name: "Portfolio Ready",
  type: "checkbox",
  description: "Indicates if work can be publicly showcased.",
});

export const priorityProperty = defineProperty({
  key: "priority",
  name: "Priority",
  type: "select",
  description: "Execution priority used for planning.",
  options: projectPriorityOptions,
});

export const notesProperty = defineProperty({
  key: "notes",
  name: "Notes",
  type: "text",
  description: "Operational notes, decisions, and context.",
  multiline: true,
});

export const projectProperties = [
  projectNameProperty,
  projectStatusProperty,
  projectTypeProperty,
  clientProperty,
  studioProperty,
  startDateProperty,
  targetCompletionProperty,
  engineProperty,
  middlewareProperty,
  repositoryProperty,
  portfolioReadyProperty,
  priorityProperty,
  notesProperty,
] as const;

export type ProjectProperty = (typeof projectProperties)[number];
export type ProjectPropertyKey = ProjectProperty["key"];
