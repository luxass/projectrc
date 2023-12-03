import {
  type BaseSchema,
  array,
  boolean,
  merge,
  object,
  optional,
  regex,
  string,
  union,
} from "valibot";

import type { JSONSchema7 } from "json-schema";

const JSON_SCHEMA_FEATURES_KEY = "__json_schema_features";

export type JSONSchemaFeatures = Partial<JSONSchema7>;

export interface WithJSONSchemaFeatures {
  [JSON_SCHEMA_FEATURES_KEY]: JSONSchemaFeatures
}

/**
 * Function to add JSON schema features to a valibot schema.
 * @param {S} schema - The base schema.
 * @param {JSONSchemaFeatures} features - The JSON schema features to add.
 * @returns {S & WithJSONSchemaFeatures} The base schema with added JSON schema features.
 */
export function withJSONSchemaFeatures<S extends BaseSchema>(schema: S, features: JSONSchemaFeatures): S & WithJSONSchemaFeatures {
  return Object.assign(schema, { [JSON_SCHEMA_FEATURES_KEY]: features });
}

export const DEPRECATION_SCHEMA = withJSONSchemaFeatures(optional(object({
  message: withJSONSchemaFeatures(string(), {
    description: "The deprecation message.",
  }),
  replacement: withJSONSchemaFeatures(optional(string()), {
    description: "The replacement package. If not set, the package is considered deprecated without a replacement.",
  }),
})), {
  description: "Deprecation information.",
});

export const PROJECT_SCHEMA = withJSONSchemaFeatures(object({
  description: withJSONSchemaFeatures(optional(string()), {
    description: "The description of the project.",
  }),
  handles: withJSONSchemaFeatures(optional(array(string([regex(/^/)]))), {
    description: "The handles of the project. Will be able to be used in luxass.dev/<PROJECT_HANDLE>",
  }),
  ignore: withJSONSchemaFeatures(optional(boolean()), {
    description: "Ignore this project.",
  }),
  npm: withJSONSchemaFeatures(optional(union([boolean(), string()])), {
    description: "The npm package name of the project.",
  }),
  readme: withJSONSchemaFeatures(optional(union([boolean(), string()])), {
    description: "The path to the readme file.",
  }),
  website: withJSONSchemaFeatures(optional(union([boolean(), withJSONSchemaFeatures(string(
    // MAYBE URL?
  ), {
    format: "uri",
  })])), {
    description: "The website of the project. If set to `true`, the website is based on repository URL.",
  }),
  deprecated: DEPRECATION_SCHEMA,
}), {
  description: "Project configuration",
});

export const MONOREPO_SCHEMA = object({
  enabled: withJSONSchemaFeatures(optional(boolean()), {
    description: "Enable monorepo mode.",
  }),
  ignores: withJSONSchemaFeatures(optional(array(string())), {
    description: "Ignore these projects.",
  }),
  overrides: withJSONSchemaFeatures(optional(
    array(
      merge([
        object({
          name: string(),
        }),
        PROJECT_SCHEMA,
      ]),
    ),
  ), {
    description: "Override project configuration.",
  }),
});

export const SCHEMA = merge([
  PROJECT_SCHEMA,
  object({
    monorepo: optional(withJSONSchemaFeatures(MONOREPO_SCHEMA, {
      description: "Monorepo configuration",
    })),
  }),
]);
