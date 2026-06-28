import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type { EmailPropertyDefinition } from "../../schema/property.js";

export function translateEmailProperty(
  property: EmailPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    email: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
