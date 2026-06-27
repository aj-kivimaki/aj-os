import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type {
  CheckboxPropertyDefinition,
  DatePropertyDefinition,
  MultiSelectPropertyDefinition,
  PropertyDefinition,
  UrlPropertyDefinition,
} from "../../schema/property.js";
import { translateCheckboxProperty } from "./checkbox.js";
import { translateDateProperty } from "./date.js";
import { translateMultiSelectProperty } from "./multi-select.js";
import { translateNumberProperty } from "./number.js";
import { translateSelectProperty } from "./select.js";
import { translateTextProperty } from "./text.js";
import { translateTitleProperty } from "./title.js";
import { translateUrlProperty } from "./url.js";

export type TranslatablePropertyType =
  | "title"
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url";

export function isTranslatablePropertyType(
  type: PropertyDefinition["type"],
): type is TranslatablePropertyType {
  return (
    type === "title" ||
    type === "text" ||
    type === "number" ||
    type === "select" ||
    type === "multi_select" ||
    type === "date" ||
    type === "checkbox" ||
    type === "url"
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
    case "multi_select":
      return translateMultiSelectProperty(
        property as MultiSelectPropertyDefinition,
      );
    case "date":
      return translateDateProperty(property as DatePropertyDefinition);
    case "checkbox":
      return translateCheckboxProperty(property as CheckboxPropertyDefinition);
    case "url":
      return translateUrlProperty(property as UrlPropertyDefinition);
    default:
      throw new Error(
        `Unsupported property type for Notion translation: ${property.type}`,
      );
  }
}
