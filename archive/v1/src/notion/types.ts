import type {
  CreateDatabaseParameters,
  UpdateDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints.js";

export type PropertyConfigurationRequest =
  CreateDatabaseParameters["properties"][string];

export type RichTextItemRequest = NonNullable<
  CreateDatabaseParameters["title"]
>[number];

export type DatabasePropertyUpdateRequest = Exclude<
  NonNullable<UpdateDatabaseParameters["properties"]>[string],
  null
>;
