import type { PropertyConfigurationRequest } from "../types.js";

import type { DatePropertyDefinition } from "../../schema/property.js";

export function translateDateProperty(
  property: DatePropertyDefinition,
): PropertyConfigurationRequest {
  return {
    date: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
