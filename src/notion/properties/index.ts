import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type {
  PropertyDefinition,
} from "../../schema/property.js";
import { translateNumberProperty } from "./number.js";
import { translateSelectProperty } from "./select.js";
import { translateTextProperty } from "./text.js";
import { translateTitleProperty } from "./title.js";

export type TranslatablePropertyType = "title" | "text" | "number" | "select";

export function isTranslatablePropertyType(
  type: PropertyDefinition["type"],
): type is TranslatablePropertyType {
  return (
    type === "title" ||
    type === "text" ||
    type === "number" ||
    type === "select"
  );
}

export function translateProperty(
  property: PropertyDefinition,
): PropertyConfigurationRequest {
  switch (property.type) {
    case "title":
      return translateTitleProperty(property);
    case "text":
      return translateTextProperty(property);
    case "number":
      return translateNumberProperty(property);
    case "select":
      return translateSelectProperty(property);
    default:
      throw new Error(
        `Unsupported property type for Notion translation: ${property.type}`,
      );
  }
}
