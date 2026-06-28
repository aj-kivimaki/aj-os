import type { PropertyConfigurationRequest } from "../types.js";

import type { EmailPropertyDefinition } from "../../schema/property.js";

export function translateEmailProperty(
  property: EmailPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    email: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
