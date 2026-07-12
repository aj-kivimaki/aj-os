import {
  productionMusicGenreOptions,
  productionMusicMoodOptions,
  productionMusicStatusOptions,
} from "./properties.js";

type OptionValue<TOptions extends readonly { readonly value: string }[]> =
  TOptions[number]["value"];

export type ProductionMusicStatus = OptionValue<
  typeof productionMusicStatusOptions
>;
export type ProductionMusicGenre = OptionValue<
  typeof productionMusicGenreOptions
>;
export type ProductionMusicMood = OptionValue<
  typeof productionMusicMoodOptions
>;

export interface ProductionMusicTemplateValues {
  readonly status: ProductionMusicStatus;
  readonly genre: ProductionMusicGenre;
  readonly mood: readonly ProductionMusicMood[];
  readonly duration: string;
  readonly bpm: number;
  readonly published: boolean;
}

export interface ProductionMusicTemplateDefinition {
  readonly key:
    | "cinematic-cue"
    | "hybrid-action"
    | "ambient"
    | "horror"
    | "album-track";
  readonly name:
    | "Cinematic Cue"
    | "Hybrid Action"
    | "Ambient"
    | "Horror"
    | "Production Music Album Track";
  readonly description: string;
  readonly defaults: ProductionMusicTemplateValues;
}

export const cinematicCueTemplate: ProductionMusicTemplateDefinition = {
  key: "cinematic-cue",
  name: "Cinematic Cue",
  description:
    "Template for broad cinematic cues aimed at trailer-style and sync-ready briefs.",
  defaults: {
    status: "draft",
    genre: "cinematic",
    mood: ["epic", "emotional"],
    duration: "02:30",
    bpm: 120,
    published: false,
  },
};

export const hybridActionTemplate: ProductionMusicTemplateDefinition = {
  key: "hybrid-action",
  name: "Hybrid Action",
  description:
    "Template for high-energy hybrid action cues with pulse-driven arrangement.",
  defaults: {
    status: "draft",
    genre: "hybrid",
    mood: ["aggressive", "tense"],
    duration: "02:10",
    bpm: 128,
    published: false,
  },
};

export const ambientTemplate: ProductionMusicTemplateDefinition = {
  key: "ambient",
  name: "Ambient",
  description:
    "Template for atmospheric and textural cues suitable for underscore and calm scenes.",
  defaults: {
    status: "draft",
    genre: "ambient",
    mood: ["relaxed", "mysterious"],
    duration: "02:50",
    bpm: 80,
    published: false,
  },
};

export const horrorTemplate: ProductionMusicTemplateDefinition = {
  key: "horror",
  name: "Horror",
  description:
    "Template for dark suspense cues designed for tension-heavy placements.",
  defaults: {
    status: "draft",
    genre: "horror",
    mood: ["dark", "suspense"],
    duration: "01:55",
    bpm: 95,
    published: false,
  },
};

export const productionMusicAlbumTrackTemplate: ProductionMusicTemplateDefinition =
  {
    key: "album-track",
    name: "Production Music Album Track",
    description:
      "Template for cues planned as part of a cohesive production music album release.",
    defaults: {
      status: "ready",
      genre: "orchestral",
      mood: ["epic", "hopeful"],
      duration: "03:00",
      bpm: 110,
      published: false,
    },
  };

export const productionMusicTemplates = [
  cinematicCueTemplate,
  hybridActionTemplate,
  ambientTemplate,
  horrorTemplate,
  productionMusicAlbumTrackTemplate,
] as const;

export function createProductionMusicTemplateValues(
  overrides: Partial<ProductionMusicTemplateValues> = {},
  template: ProductionMusicTemplateDefinition = cinematicCueTemplate,
): ProductionMusicTemplateValues {
  return {
    ...template.defaults,
    ...overrides,
  };
}
