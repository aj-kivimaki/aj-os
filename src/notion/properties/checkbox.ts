import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type { CheckboxPropertyDefinition } from "../../schema/property.js";

export function translateCheckboxProperty(
  property: CheckboxPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    checkbox: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
