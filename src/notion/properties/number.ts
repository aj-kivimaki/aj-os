import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type { NumberPropertyDefinition } from "../../schema/property.js";

export function translateNumberProperty(
  property: NumberPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    number: {
      format: "number",
    },
    ...(property.description ? { description: property.description } : {}),
  };
}
