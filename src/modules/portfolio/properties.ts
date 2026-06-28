import { defineProperty } from "../../schema/property.js";

export const portfolioCategoryOptions = [
  { value: "game", label: "Game" },
  { value: "audio", label: "Audio" },
  { value: "music", label: "Music" },
  { value: "tool", label: "Tool" },
  { value: "plugin", label: "Plugin" },
  { value: "demo", label: "Demo" },
  { value: "prototype", label: "Prototype" },
] as const;

export const portfolioStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

export const portfolioTitleProperty = defineProperty({
  key: "title",
  name: "Title",
  type: "title",
  description: "Public-facing name for the portfolio entry.",
  required: true,
});

export const portfolioCategoryProperty = defineProperty({
  key: "category",
  name: "Category",
  type: "select",
  description:
    "Portfolio content category used for presentation and filtering.",
  required: true,
  options: portfolioCategoryOptions,
});

export const portfolioStatusProperty = defineProperty({
  key: "status",
  name: "Status",
  type: "select",
  description: "Publication lifecycle status for this portfolio entry.",
  required: true,
  options: portfolioStatusOptions,
});

export const portfolioReleaseDateProperty = defineProperty({
  key: "releaseDate",
  name: "Release Date",
  type: "date",
  description: "Date when the piece was publicly released or announced.",
});

export const portfolioPublicUrlProperty = defineProperty({
  key: "publicUrl",
  name: "Public URL",
  type: "url",
  description: "Canonical public link for showcasing this work.",
});

export const portfolioRepositoryProperty = defineProperty({
  key: "repository",
  name: "Repository",
  type: "url",
  description: "Source repository URL when code is publicly available.",
});

export const portfolioFeaturedProperty = defineProperty({
  key: "featured",
  name: "Featured",
  type: "checkbox",
  description: "Highlights this entry as a featured piece.",
});

export const portfolioNotesProperty = defineProperty({
  key: "notes",
  name: "Notes",
  type: "text",
  description: "Context, production notes, and presentation remarks.",
  multiline: true,
});

export const portfolioProperties = [
  portfolioTitleProperty,
  portfolioCategoryProperty,
  portfolioStatusProperty,
  portfolioReleaseDateProperty,
  portfolioPublicUrlProperty,
  portfolioRepositoryProperty,
  portfolioFeaturedProperty,
  portfolioNotesProperty,
] as const;

export type PortfolioProperty = (typeof portfolioProperties)[number];
export type PortfolioPropertyKey = PortfolioProperty["key"];
