import type { PropertyConfigurationRequest } from "../types.js";

import type {
  MultiSelectPropertyDefinition,
  SelectOptionDefinition,
} from "../../schema/property.js";

function toNotionMultiSelectOption(option: SelectOptionDefinition): {
  name: string;
} {
  return {
    name: option.label,
  };
}

export function translateMultiSelectProperty(
  property: MultiSelectPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    multi_select: {
      options: property.options.map(toNotionMultiSelectOption),
    },
    ...(property.description ? { description: property.description } : {}),
  };
}
