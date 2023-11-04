import { array, boolean, object, optional, startsWith, string, union, url } from "valibot";

export const SCHEMA = object({
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

  monorepo: optional(boolean(), false),
});
