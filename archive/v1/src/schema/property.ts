export type PropertyType =
  | "title"
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone";

export interface BasePropertyDefinition<
  TKey extends string,
  TType extends PropertyType,
> {
  readonly key: TKey;
  readonly name: string;
  readonly type: TType;
  readonly description?: string;
  readonly required?: boolean;
}

export interface SelectOptionDefinition {
  readonly value: string;
  readonly label: string;
}

export interface NumberConfig {
  readonly precision?: 0 | 1 | 2 | 3 | 4;
  readonly min?: number;
  readonly max?: number;
}

export interface TitlePropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "title"> {}

export interface TextPropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "text"> {
  readonly multiline?: boolean;
}

export interface NumberPropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "number"> {
  readonly number?: NumberConfig;
}

export interface SelectPropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "select"> {
  readonly options: readonly SelectOptionDefinition[];
}

export interface MultiSelectPropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "multi_select"> {
  readonly options: readonly SelectOptionDefinition[];
}

export interface DatePropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "date"> {
  readonly includeTime?: boolean;
}

export interface CheckboxPropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "checkbox"> {}

export interface UrlPropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "url"> {}

export interface EmailPropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "email"> {}

export interface PhonePropertyDefinition<
  TKey extends string = string,
> extends BasePropertyDefinition<TKey, "phone"> {}

export type PropertyDefinition<TKey extends string = string> =
  | TitlePropertyDefinition<TKey>
  | TextPropertyDefinition<TKey>
  | NumberPropertyDefinition<TKey>
  | SelectPropertyDefinition<TKey>
  | MultiSelectPropertyDefinition<TKey>
  | DatePropertyDefinition<TKey>
  | CheckboxPropertyDefinition<TKey>
  | UrlPropertyDefinition<TKey>
  | EmailPropertyDefinition<TKey>
  | PhonePropertyDefinition<TKey>;

export function defineProperty<TKey extends string>(
  definition: PropertyDefinition<TKey>,
): PropertyDefinition<TKey> {
  return definition;
}
