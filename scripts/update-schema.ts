import { exit } from "node:process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import { Kind, Type, TypeRegistry } from "@sinclair/typebox";
import type { SchemaOptions, Static, TSchema, TUnion } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

TypeRegistry.Set(
  "ExtendedOneOf",
  (schema: any, value) =>
    schema.oneOf.reduce(
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
  readme: Type.Optional(
    OneOf(
      [
        Type.Boolean({
          description: "Will use the root readme.md as the repository readme",
          default: false,
        }),
        Type.String({
          description: "Will use the given file as the repository readme",
          default: "README.md",
        }),
      ],
      {
        default: false,
        description:
          "If defined will show the repository readme at luxass.dev/projects/repo-name",
      },
    ),
  ),
  npm: Type.Optional(
    OneOf(
      [
        Type.Boolean({
          description:
            "Will find the first package.json in the repo and use the `name` as the npm package name",
          default: false,
        }),
        Type.String({
          description:
            "Will use the given package.json to find the npm package name",
          default: "package.json",
        }),
      ],
      {
        description:
          "Does the repo have a npm package and should it be visible on luxass.dev?",
        default: false,
      },
    ),
  ),
  ignore: Type.Optional(
    Type.Boolean({
      description: "Ignore this repository from being used",
      default: false,
    }),
  ),
  website: Type.Optional(
    OneOf(
      [
        Type.Boolean({
          description: "Will use homepageUrl from github as the website url",
          default: false,
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
  handles: Type.Optional(
    Type.Array(
      Type.String({
        description:
          "The paths to use for this project, if not defined will use the default `/projects/repo-name`",
        pattern: "^/",
      }),
    ),
  ),
});

const MONOREPO_SCHEMA = Type.Object({
  enabled: Type.Boolean({
    description: "Is this a monorepo?",
    default: false,
  }),
  ignores: Type.Optional(
    Type.Array(
      Type.String({
        description: "Ignore these packages from being used",
      }),
    ),
  ),
  packages: Type.Optional(
    Type.Array(
      Type.Composite([
        PROJECTRC_SCHEMA,
        Type.Object(
          {
            name: Type.String({
              description: "The name of the package",
            }),
            path: Type.Optional(
              Type.String({
                description: "The path to the package",
                default: ".",
              }),
            ),
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
