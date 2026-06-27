import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type { DatePropertyDefinition } from "../../schema/property.js";

export function translateDateProperty(
  property: DatePropertyDefinition,
): PropertyConfigurationRequest {
  return {
    date: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
