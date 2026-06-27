import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type { TextPropertyDefinition } from "../../schema/property.js";

export function translateTextProperty(
  property: TextPropertyDefinition,
): PropertyConfigurationRequest {
  return {
    rich_text: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
