import { boolean, object, optional, string, union } from "valibot";

export const SCHEMA = object({
  readme: optional(union([
    boolean(),
    string(),
  ]), false),
});
