import { array, boolean, merge, object, optional, startsWith, string, union, url } from "valibot";

const PROJECT_SCHEMA = object({
  readme: optional(union([
    boolean(),
    optional(string(), "README.md"),
  ]), false),
  npm: optional(union([
    boolean(),
    optional(string(), "package.json"),
  ]), false),

  ignore: optional(boolean(), false),

  website: optional(union([
    boolean(),
    string([url()]),
  ]), false),

  handles: optional(array(
    string([
      startsWith("/"),
    ]),
  ), []),
});

export const SCHEMA = merge([
  PROJECT_SCHEMA,
  object({
    monorepo: optional(boolean(), false),
    packages: optional(array(
      PROJECT_SCHEMA,
    ), []),
  }),
]);
