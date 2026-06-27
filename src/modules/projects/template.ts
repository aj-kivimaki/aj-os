import {
  projectPriorityOptions,
  projectStatusOptions,
  projectTypeOptions,
} from "./properties.js";

type OptionValue<TOptions extends readonly { readonly value: string }[]> =
  TOptions[number]["value"];

export type ProjectStatus = OptionValue<typeof projectStatusOptions>;
export type ProjectType = OptionValue<typeof projectTypeOptions>;
export type ProjectPriority = OptionValue<typeof projectPriorityOptions>;

export interface ProjectTemplateValues {
  readonly status: ProjectStatus;
  readonly projectType: ProjectType;
  readonly portfolioReady: boolean;
  readonly priority: ProjectPriority;
}

export interface ProjectTemplateDefinition {
  readonly key: "default-project";
  readonly name: "Default Project";
  readonly description: string;
  readonly defaults: ProjectTemplateValues;
}

export const defaultProjectTemplate: ProjectTemplateDefinition = {
  key: "default-project",
  name: "Default Project",
  description:
    "Baseline values for new projects to reduce setup friction and keep status naming consistent.",
  defaults: {
    status: "backlog",
    projectType: "internal_experiment",
    portfolioReady: false,
    priority: "medium",
  },
};

export function createProjectTemplateValues(
  overrides: Partial<ProjectTemplateValues> = {},
): ProjectTemplateValues {
  return {
    ...defaultProjectTemplate.defaults,
    ...overrides,
  };
}
