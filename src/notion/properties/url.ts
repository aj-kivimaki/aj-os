import type { PropertyConfigurationRequest } from "../types.js";

import type { UrlPropertyDefinition } from "../../schema/property.js";

export function translateUrlProperty(
  property: UrlPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    url: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
