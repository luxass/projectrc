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
  categories: optional(array(union([string(), object({
    key: string(),
    name: string(),
  })]))),
  description: optional(string()),
  handles: optional(array(string([startsWith("/")]))),
  ignore: optional(boolean()),
  npm: optional(union([boolean(), optional(string())])),
  readme: optional(union([boolean(), optional(string())])),
  website: optional(union([boolean(), string([url()])])),
  deprecated: optional(union([
    boolean(),
    optional(object({
      message: string(),
      replacement: optional(string()),
    })),
  ])),
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
