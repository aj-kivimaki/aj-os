import { gameJamRoleOptions, gameJamStatusOptions } from "./properties.js";

type OptionValue<TOptions extends readonly { readonly value: string }[]> =
  TOptions[number]["value"];

export type GameJamStatus = OptionValue<typeof gameJamStatusOptions>;
export type GameJamRole = OptionValue<typeof gameJamRoleOptions>;

export interface GameJamTemplateValues {
  readonly status: GameJamStatus;
  readonly role: GameJamRole;
  readonly teamSize: number;
}

export interface GameJamTemplateDefinition {
  readonly key: "solo-jam" | "team-jam" | "weekend-jam" | "online-jam";
  readonly name: "Solo Jam" | "Team Jam" | "Weekend Jam" | "Online Jam";
  readonly description: string;
  readonly defaults: GameJamTemplateValues;
}

export const soloJamTemplate: GameJamTemplateDefinition = {
  key: "solo-jam",
  name: "Solo Jam",
  description:
    "Template for solo game jam participation focused on rapid end-to-end execution.",
  defaults: {
    status: "planned",
    role: "composer",
    teamSize: 1,
  },
};

export const teamJamTemplate: GameJamTemplateDefinition = {
  key: "team-jam",
  name: "Team Jam",
  description:
    "Template for multi-discipline team jams where collaboration and role clarity are critical.",
  defaults: {
    status: "planned",
    role: "audio",
    teamSize: 4,
  },
};

export const weekendJamTemplate: GameJamTemplateDefinition = {
  key: "weekend-jam",
  name: "Weekend Jam",
  description:
    "Template for short-format weekend jams with tight deadlines and focused scope.",
  defaults: {
    status: "active",
    role: "sound_designer",
    teamSize: 2,
  },
};

export const onlineJamTemplate: GameJamTemplateDefinition = {
  key: "online-jam",
  name: "Online Jam",
  description:
    "Template for remote-first jams with distributed teams and asynchronous collaboration.",
  defaults: {
    status: "planned",
    role: "generalist",
    teamSize: 3,
  },
};

export const gameJamTemplates = [
  soloJamTemplate,
  teamJamTemplate,
  weekendJamTemplate,
  onlineJamTemplate,
] as const;

export function createGameJamTemplateValues(
  overrides: Partial<GameJamTemplateValues> = {},
  template: GameJamTemplateDefinition = soloJamTemplate,
): GameJamTemplateValues {
  return {
    ...template.defaults,
    ...overrides,
  };
}
