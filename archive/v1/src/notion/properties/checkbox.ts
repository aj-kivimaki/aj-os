import type { PropertyConfigurationRequest } from "../types.js";

import type { CheckboxPropertyDefinition } from "../../schema/property.js";

export function translateCheckboxProperty(
  property: CheckboxPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    checkbox: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
