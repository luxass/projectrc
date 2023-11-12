import {
  array,
  boolean,
  merge,
  object,
  optional,
  startsWith,
  string,
  union,
  url,
} from "valibot";

const PROJECT_SCHEMA = object({
  readme: optional(union([boolean(), optional(string())])),
  npm: optional(union([boolean(), optional(string())])),
  ignore: optional(boolean()),
  website: optional(union([boolean(), string([url()])])),
  handles: optional(array(string([startsWith("/")]))),
  description: optional(string()),
  categories: optional(array(union([string(), object({
    key: string(),
    name: string(),
  })]))),
});

const MONOREPO_SCHEMA = object({
  enabled: optional(boolean()),
  ignores: optional(array(string())),
  overrides: optional(
    array(
      merge([
        object({
          name: string(),
        }),
        PROJECT_SCHEMA,
      ]),
    ),
    [],
  ),
});

export const SCHEMA = merge([
  PROJECT_SCHEMA,
  object({
    monorepo: optional(MONOREPO_SCHEMA),
  }),
]);
