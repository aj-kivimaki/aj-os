import {
  contactSourceOptions,
  interestedInOptions,
  relationshipStatusOptions,
} from "./properties.js";

type OptionValue<TOptions extends readonly { readonly value: string }[]> =
  TOptions[number]["value"];

export type RelationshipStatus = OptionValue<typeof relationshipStatusOptions>;
export type ContactSource = OptionValue<typeof contactSourceOptions>;
export type InterestedIn = OptionValue<typeof interestedInOptions>;

export interface CRMTemplateValues {
  readonly relationshipStatus: RelationshipStatus;
  readonly contactSource?: ContactSource;
  readonly interestedIn: readonly InterestedIn[];
}

export interface CRMTemplateDefinition {
  readonly key: "default-crm" | "game-jam-contact" | "referral-intro";
  readonly name: "Default CRM" | "Game Jam Contact" | "Referral Intro";
  readonly description: string;
  readonly defaults: CRMTemplateValues;
}

export const defaultCRMTemplate: CRMTemplateDefinition = {
  key: "default-crm",
  name: "Default CRM",
  description:
    "General-purpose default for new contacts with an early-stage relationship and networking focus.",
  defaults: {
    relationshipStatus: "new",
    interestedIn: ["networking"],
  },
};

export const gameJamContactTemplate: CRMTemplateDefinition = {
  key: "game-jam-contact",
  name: "Game Jam Contact",
  description:
    "Template for people met in game jams where collaboration opportunities often emerge.",
  defaults: {
    relationshipStatus: "met",
    contactSource: "game_jam",
    interestedIn: ["collaboration", "networking"],
  },
};

export const referralIntroTemplate: CRMTemplateDefinition = {
  key: "referral-intro",
  name: "Referral Intro",
  description:
    "Template for warm introductions through trusted contacts or referrals.",
  defaults: {
    relationshipStatus: "active",
    contactSource: "referral",
    interestedIn: ["freelance_audio", "collaboration"],
  },
};

export const crmTemplates = [
  defaultCRMTemplate,
  gameJamContactTemplate,
  referralIntroTemplate,
] as const;

export function createCRMTemplateValues(
  overrides: Partial<CRMTemplateValues> = {},
  template: CRMTemplateDefinition = defaultCRMTemplate,
): CRMTemplateValues {
  return {
    ...template.defaults,
    ...overrides,
  };
}
