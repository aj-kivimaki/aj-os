import { portfolioDatabaseDefinition } from "./database.js";

export {
  PORTFOLIO_DATABASE_KEY,
  portfolioDatabaseDefinition,
  portfolioRelations,
  type PortfolioDatabaseDefinition,
  type PortfolioRelation,
} from "./database.js";

export const portfolioModule = {
  key: portfolioDatabaseDefinition.key,
  displayName: "Portfolio",
  databaseDefinition: portfolioDatabaseDefinition,
} as const;

export {
  portfolioCategoryOptions,
  portfolioCategoryProperty,
  portfolioFeaturedProperty,
  portfolioNotesProperty,
  portfolioProperties,
  portfolioPublicUrlProperty,
  portfolioReleaseDateProperty,
  portfolioRepositoryProperty,
  portfolioStatusOptions,
  portfolioStatusProperty,
  portfolioTitleProperty,
  type PortfolioProperty,
  type PortfolioPropertyKey,
} from "./properties.js";

export {
  audioDemoTemplate,
  createPortfolioTemplateValues,
  portfolioTemplates,
  prototypeTemplate,
  releasedGameTemplate,
  toolTemplate,
  type PortfolioCategory,
  type PortfolioStatus,
  type PortfolioTemplateDefinition,
  type PortfolioTemplateValues,
} from "./template.js";
