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
  readme: optional(union([boolean(), optional(string(), "README.md")]), false),
  npm: optional(union([boolean(), optional(string(), "package.json")]), false),
  ignore: optional(boolean(), false),
  website: optional(union([boolean(), string([url()])]), false),
  handles: optional(array(string([startsWith("/")])), []),
});

const MONOREPO_SCHEMA = object({
  enabled: optional(boolean(), false),
  ignore: optional(array(string()), []),
  packages: optional(array(merge([
    object({
      name: string(),
      path: optional(string(), "."),
    }),
    PROJECT_SCHEMA,
  ])), []),
});

export const SCHEMA = merge([
  PROJECT_SCHEMA,
  object({
    monorepo: optional(MONOREPO_SCHEMA),
  }),
]);
