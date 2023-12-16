import type { BaseSchema } from "valibot";
import {
  array,
  boolean,
  merge,
  object,
  optional,
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
};

export const NPM_PROJECT_SCHEMA = withJSONSchemaFeatures(
  optional(
    union([
      withJSONSchemaFeatures(boolean(), {
        description: "If set to true, will infer the npm package name from repository and also include downloads",
      }),
      object({
        enabled: withJSONSchemaFeatures(
          boolean(),
          {
            description: "Enable if project has a npm package, if `link` is not set the package name is auto inferred from the repository",
          },
        ),
        name: withJSONSchemaFeatures(
          optional(
            withJSONSchemaFeatures(string(), {
              description: "The npm package name",
            }),
          ),
          {
            description:
              "Override the auto inferred npm package name.",
          },
        ),
        downloads: withJSONSchemaFeatures(
          optional(
            boolean(),
          ),
          {
            description:
              "Include the npm package downloads.",
          },
        ),
      }),
    ]),
  ),
  {},
);

export const PROJECT_SCHEMA = withJSONSchemaFeatures(
  object({
    description: withJSONSchemaFeatures(optional(string()), {
      description:
        "The description of the project. Will be used as meta description.",
    }),
    title: withJSONSchemaFeatures(optional(string()), {
      description: "The title of the project. Will be used as title.",
    }),
    ignore: withJSONSchemaFeatures(optional(boolean()), {
      description: "Ignore this project in the project list.",
    }),
    npm: NPM_PROJECT_SCHEMA,
    readme: withJSONSchemaFeatures(optional(union([boolean(), string()])), {
      description:
        "The path to the readme file. If set to true the readme file is the root readme file.",
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
    stars: withJSONSchemaFeatures(
      optional(
        boolean(),
      ),
      {
        description:
          "Include repository stars",
      },
    ),
    version: withJSONSchemaFeatures(
      optional(
        boolean(),
      ),
      {
        description:
          "Include latest version of the npm package, will use either a tag from github or the latest version from npm.",
      },
    ),
    deprecated: withJSONSchemaFeatures(
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
    ),
  }),
  {
    description: "Project configuration",
  },
);

export const WORKSPACE_SCHEMA = object({
  enabled: withJSONSchemaFeatures(optional(boolean()), {
    description: "Is monorepo workspaces enabled",
  }),
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
    workspace: optional(
      withJSONSchemaFeatures(WORKSPACE_SCHEMA, {
        description: "Workspace configuration",
      }),
    ),
  }),
]);
