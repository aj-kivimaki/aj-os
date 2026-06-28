import {
  portfolioCategoryOptions,
  portfolioStatusOptions,
} from "./properties.js";

type OptionValue<TOptions extends readonly { readonly value: string }[]> =
  TOptions[number]["value"];

export type PortfolioCategory = OptionValue<typeof portfolioCategoryOptions>;
export type PortfolioStatus = OptionValue<typeof portfolioStatusOptions>;

export interface PortfolioTemplateValues {
  readonly category: PortfolioCategory;
  readonly status: PortfolioStatus;
  readonly featured: boolean;
}

export interface PortfolioTemplateDefinition {
  readonly key: "released-game" | "audio-demo" | "tool" | "prototype";
  readonly name: "Released Game" | "Audio Demo" | "Tool" | "Prototype";
  readonly description: string;
  readonly defaults: PortfolioTemplateValues;
}

export const releasedGameTemplate: PortfolioTemplateDefinition = {
  key: "released-game",
  name: "Released Game",
  description:
    "Template for a shipped game project with public-facing links and release metadata.",
  defaults: {
    category: "game",
    status: "published",
    featured: true,
  },
};

export const audioDemoTemplate: PortfolioTemplateDefinition = {
  key: "audio-demo",
  name: "Audio Demo",
  description:
    "Template for a focused audio showcase piece or interactive sound design demo.",
  defaults: {
    category: "audio",
    status: "published",
    featured: false,
  },
};

export const toolTemplate: PortfolioTemplateDefinition = {
  key: "tool",
  name: "Tool",
  description:
    "Template for utilities, plugins, or workflow tools intended for public showcase.",
  defaults: {
    category: "tool",
    status: "published",
    featured: false,
  },
};

export const prototypeTemplate: PortfolioTemplateDefinition = {
  key: "prototype",
  name: "Prototype",
  description:
    "Template for exploratory work-in-progress pieces that are not fully released.",
  defaults: {
    category: "prototype",
    status: "draft",
    featured: false,
  },
};

export const portfolioTemplates = [
  releasedGameTemplate,
  audioDemoTemplate,
  toolTemplate,
  prototypeTemplate,
] as const;

export function createPortfolioTemplateValues(
  overrides: Partial<PortfolioTemplateValues> = {},
  template: PortfolioTemplateDefinition = releasedGameTemplate,
): PortfolioTemplateValues {
  return {
    ...template.defaults,
    ...overrides,
  };
}
