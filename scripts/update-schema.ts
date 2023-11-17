import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { exit } from "node:process";
import { fileURLToPath } from "node:url";
import type { SchemaOptions, Static, TSchema, TUnion } from "@sinclair/typebox";

import { Kind, Type, TypeRegistry } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

TypeRegistry.Set(
  "ExtendedOneOf",
  (schema: any, value) => schema.oneOf.reduce(
    (acc: number, schema: any) => acc + (Value.Check(schema, value) ? 1 : 0),
    0,
  ) === 1,
);

function OneOf<T extends TSchema[]>(
  oneOf: [...T],
  options: SchemaOptions = {},
) {
  return Type.Unsafe<Static<TUnion<T>>>({
    ...options,
    [Kind]: "ExtendedOneOf",
    oneOf,
  });
}

const PROJECTRC_SCHEMA = Type.Object({
  categories: Type.Optional(
    Type.Array(
      OneOf([
        Type.String({
          description: "The key of the category",
        }),
        Type.Object({
          key: Type.String({
            description: "The key of the category",
          }),
          name: Type.String({
            description: "The name of the category",
          }),
        }),
      ]),
    ),
  ),
  description: Type.Optional(
    Type.String({
      description: "The description of the project",
    }),
  ),
  deprecated: Type.Optional(
    OneOf([Type.Boolean({
      default: false,
      description: "Is this project deprecated?",
    }), Type.Object({
      message: Type.String({
        description: "The message to show when the project is deprecated",
      }),
      replacement: Type.Optional(
        Type.String({
          description: "The replacement for the project",
        }),
      ),
    })]),
  ),
  handles: Type.Optional(
    Type.Array(
      Type.String({
        description:
          "The paths to use for this project, if not defined will use the default `/projects/repo-name`",
        pattern: "^/",
      }),
    ),
  ),
  ignore: Type.Optional(
    Type.Boolean({
      default: false,
      description: "Ignore this repository from being used",
    }),
  ),
  npm: Type.Optional(
    OneOf(
      [
        Type.Boolean({
          default: false,
          description:
            "Will find the first package.json in the repo and use the `name` as the npm package name",
        }),
        Type.String({
          default: "package.json",
          description:
            "Will use the given package.json to find the npm package name",
        }),
      ],
      {
        default: false,
        description:
          "Does the repo have a npm package and should it be visible on luxass.dev?",
      },
    ),
  ),
  readme: Type.Optional(
    OneOf(
      [
        Type.Boolean({
          default: false,
          description: "Will use the root readme.md as the repository readme",
        }),
        Type.String({
          default: "README.md",
          description: "Will use the given file as the repository readme",
        }),
      ],
      {
        default: false,
        description:
          "If defined will show the repository readme at luxass.dev/projects/repo-name",
      },
    ),
  ),
  website: Type.Optional(
    OneOf(
      [
        Type.Boolean({
          default: false,
          description: "Will use homepageUrl from github as the website url",
        }),
        Type.String({
          description: "The url to the website",
          format: "uri",
        }),
      ],
      {
        default: false,
        description: "The url to the website",
      },
    ),
  ),
});

const MONOREPO_SCHEMA = Type.Object({
  enabled: Type.Boolean({
    default: false,
    description: "Is this a monorepo?",
  }),
  ignores: Type.Optional(
    Type.Array(
      Type.String({
        description: "Ignore these packages from being used",
      }),
    ),
  ),
  overrides: Type.Optional(
    Type.Array(
      Type.Composite([
        PROJECTRC_SCHEMA,
        Type.Object(
          {
            name: Type.String({
              description: "The name of the package",
            }),
          },
          {
            description: "The package",
          },
        ),
      ]),
    ),
  ),
});

const PROJECTRC_SCHEMA_ROOT = Type.Composite(
  [
    PROJECTRC_SCHEMA,
    Type.Object({
      monorepo: Type.Optional(MONOREPO_SCHEMA),
    }),
  ],
  {
    $schema: "http://json-schema.org/draft-07/schema",
    description:
      "Project configuration file for luxass.dev. See more here https://projectrc.luxass.dev",
  },
);

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function run() {
  const root = resolve(__dirname, "..");

  const projectrcDirectory = join(root, "packages/projectrc");
  const schemaFilePath = join(projectrcDirectory, "schema.json");

  await writeFile(
    schemaFilePath,
    `${JSON.stringify(PROJECTRC_SCHEMA_ROOT, null, 2)}\n`,
  );

  console.log("Wrote file to", schemaFilePath);
}

run().catch((err) => {
  console.error(err);
  exit(1);
});
