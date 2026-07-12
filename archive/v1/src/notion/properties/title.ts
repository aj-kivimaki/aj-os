import type { PropertyConfigurationRequest } from "../types.js";

import type { TitlePropertyDefinition } from "../../schema/property.js";

export function translateTitleProperty(
  property: TitlePropertyDefinition,
): PropertyConfigurationRequest {
  return {
    title: {},
    ...(property.description ? { description: property.description } : {}),
  };
}
