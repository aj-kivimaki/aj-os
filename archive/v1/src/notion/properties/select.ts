import type { PropertyConfigurationRequest } from "../types.js";

import type {
  SelectOptionDefinition,
  SelectPropertyDefinition,
} from "../../schema/property.js";

function toNotionSelectOption(option: SelectOptionDefinition): {
  name: string;
} {
  return {
    name: option.label,
  };
}

export function translateSelectProperty(
  property: SelectPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    select: {
      options: property.options.map(toNotionSelectOption),
    },
    ...(property.description ? { description: property.description } : {}),
  };
}
