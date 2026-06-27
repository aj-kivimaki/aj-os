import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type { TitlePropertyDefinition } from "../../schema/property.js";

export function translateTitleProperty(
  property: TitlePropertyDefinition,
): PropertyConfigurationRequest {
  return {
    title: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
