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
export function withJSONSchemaFeatures<S extends BaseSchema>(
  schema: S,
  features: JSONSchemaFeatures,
): S & WithJSONSchemaFeatures {
  return Object.assign(schema, { [JSON_SCHEMA_FEATURES_KEY]: features });
}

export const DEPRECATION_SCHEMA = withJSONSchemaFeatures(
  optional(
    object({
      message: withJSONSchemaFeatures(string(), {
        description: "The deprecation message.",
      }),
      replacement: withJSONSchemaFeatures(optional(string()), {
        description:
          "The replacement package. If not set, the package is considered deprecated without a replacement.",
      }),
    }),
  ),
  {
    description: "Deprecation information.",
  },
);

export const PROJECT_SCHEMA = withJSONSchemaFeatures(
  object({
    description: withJSONSchemaFeatures(optional(string()), {
      description: "The description of the project. Will be used as meta description.",
    }),
    title: withJSONSchemaFeatures(optional(string()), {
      description: "The title of the project. Will be used as title.",
    }),
    ignore: withJSONSchemaFeatures(optional(boolean()), {
      description: "Ignore this project in the project list.",
    }),
    npm: withJSONSchemaFeatures(optional(union([
      withJSONSchemaFeatures(boolean(), {
        description: "Enable if project has a npm package,",
      }),
      withJSONSchemaFeatures(string(), {
        description: "The npm package name",
      }),
    ])), {
      description: "Enable if project has a npm package. If set to true the package name is based on the on the package.json name",
    }),
    workdir: withJSONSchemaFeatures(optional(string()), {
      description: "The working directory of the project.",
    }),
    readme: withJSONSchemaFeatures(optional(union([
      boolean(),
      string(),
    ])), {
      description: "The path to the readme file. If set to true the readme file is the root readme file.",
    }),
    website: withJSONSchemaFeatures(
      optional(
        union([
          boolean(),
          withJSONSchemaFeatures(
            string(),
            // TODO: MAYBE URL?
            {
              format: "uri",
            },
          ),
        ]),
      ),
      {
        description:
          "The website of the project. If set to `true`, the website is based on repository URL.",
      },
    ),
    deprecated: DEPRECATION_SCHEMA,
  }),
  {
    description: "Project configuration",
  },
);

export const MONOREPO_SCHEMA = object({
  ignores: withJSONSchemaFeatures(optional(array(string())), {
    description: "Ignore these projects.",
  }),
  overrides: withJSONSchemaFeatures(
    optional(
      array(
        merge([
          object({
            name: string(),
          }),
          PROJECT_SCHEMA,
        ]),
      ),
    ),
    {
      description: "Override project configuration.",
    },
  ),
});

export const SCHEMA = merge([
  PROJECT_SCHEMA,
  object({
    workspaces: withJSONSchemaFeatures(optional(
      array(string()),
    ), {
      description: "Monorepo workspaces",
    }),
    workspaceOverrides: withJSONSchemaFeatures(
      optional(
        array(
          merge([
            object({
              name: string(),
            }),
            PROJECT_SCHEMA,
          ]),
        ),
      ),
      {
        description: "Override project configurations.",
      },
    ),
  }),
]);
