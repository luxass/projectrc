import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import type { Input } from "valibot";
import {
  resolveProjectRC,
} from "../src/resolve";
import type { SCHEMA } from "../src";
import { contentsHTTPHandler } from "./__handlers__/contents.http";
import { repositoryGraphQLHandler } from "./__handlers__/repository.graphql";
import { repositoryHTTPHandler } from "./__handlers__/repository.http";
import * as REPOSITORY from "./repositories";
import { treesHTTPHandler } from "./__handlers__/trees.http";

const server = setupServer(
  contentsHTTPHandler,
  repositoryHTTPHandler,
  repositoryGraphQLHandler,
  treesHTTPHandler,
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => GitHubMockedData.clear());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("should return undefined if options are incomplete", async () => {
  const result = await resolveProjectRC({
    owner: "luxass",
    repository: "projectrc",
    // @ts-expect-error Testing invalid options
    githubToken: undefined,
  });
  expect(result).toBeUndefined();
});

it("should return undefined if the repository does not exist", async () => {
  const options = {
    repository: "projectrc2",
    owner: "luxass",
    githubToken: "token",
  };
  const result = await resolveProjectRC(options);
  expect(result).toBeUndefined();
});

it("should return undefined if the repository is ignored", async () => {
  register(
    new Map([
      [
        "luxass/projectrc",
        {
          data: REPOSITORY.projectrc,
          files: {
            ".github/projectrc.json": {
              content: {
                website: true,
                npm: {
                  enabled: true,
                },
                ignore: true,
              },
            },
            "package.json": {
              content: {
                name: "projectrc",
                private: true,
              },
            },
          },
        },
      ],
    ]),
  );

  const options = {
    repository: "projectrc",
    owner: "luxass",
    githubToken: "TEST",
  };
  const result = await resolveProjectRC(options);
  expect(result).toBeUndefined();
});

it("should mark deprecated", async () => {
  register(
    new Map([
      [
        "luxass/projectrc",
        {
          data: REPOSITORY.projectrc,
          files: {
            ".github/projectrc.json": {
              content: {
                website: true,
                npm: {
                  enabled: true,
                },
                deprecated: {
                  message: "This project is deprecated",
                },
              },
            },
            "package.json": {
              content: {
                name: "@luxass/projectrc",
                private: true,
              },
            },
          },
        },
      ],
    ]),
  );

  const options = {
    repository: "projectrc",
    owner: "luxass",
    githubToken: "TEST",
  };
  const result = await resolveProjectRC(options);

  expect(result?.projects[0]).toEqual({
    description: "⚙️ Customize my projects on luxass.dev",
    title: "projectrc",
    name: "projectrc",
    website: "https://projectrc.luxass.dev",
    npm: {
      name: "@luxass/projectrc",
      url: "https://www.npmjs.com/package/@luxass/projectrc",
    },
    deprecated: {
      message: "This project is deprecated",
    },
  });
});

describe("workspace", () => {
  it("should throw if workspace is enabled but missing root package.json", async () => {
    register(
      new Map([
        [
          "luxass/projectrc",
          {
            data: REPOSITORY.projectrc,
            files: {
              ".github/projectrc.json": {
                content: {
                  $schema: "https://projectrc.luxass.dev/schema",
                  website: true,
                  workspace: {
                    enabled: true,
                  },
                },
              },
            },
          },
        ],
      ]),
    );

    await expect(() => resolveProjectRC({
      owner: "luxass",
      repository: "projectrc",
      githubToken: "TEST",
    })).rejects.toThrow(
      "projectrc: workspace is enabled, but no `package.json` file was found.\nPlease add a `package.json` file to the root of your repository.",
    );
  });

  it("should throw if workspace is enabled but missing `workspaces`", async () => {
    register(
      new Map([
        [
          "luxass/projectrc",
          {
            data: REPOSITORY.projectrc,
            files: {
              ".github/projectrc.json": {
                content: {
                  $schema: "https://projectrc.luxass.dev/schema",
                  website: true,
                  workspace: {
                    enabled: true,
                  },
                },
              },
              "package.json": {
                content: {
                  name: "projectrc",
                },
              },
            },
          },
        ],
      ]),
    );

    await expect(() => resolveProjectRC({
      owner: "luxass",
      repository: "projectrc",
      githubToken: "TEST",
    })).rejects.toThrow(
      "projectrc: workspace is enabled, but no workspaces are defined in your `package.json`.\nPlease add a `workspaces` field to your `package.json`.",
    );
  });

  it("should throw if workspace is enabled but `workspaces` empty", async () => {
    register(
      new Map([
        [
          "luxass/projectrc",
          {
            data: REPOSITORY.projectrc,
            files: {
              ".github/projectrc.json": {
                content: {
                  $schema: "https://projectrc.luxass.dev/schema",
                  website: true,
                  workspace: {
                    enabled: true,
                  },
                },
              },
              "package.json": {
                content: {
                  name: "projectrc",
                  private: true,
                  workspaces: [],
                },
              },
            },
          },
        ],
      ]),
    );

    await expect(() => resolveProjectRC({
      owner: "luxass",
      repository: "projectrc",
      githubToken: "TEST",
    })).rejects.toThrow(
      "projectrc: workspace is enabled, but no workspaces are defined in your `package.json`.\nPlease add a `workspaces` field to your `package.json`.",
    );
  });

  it("should throw if main branch is truncated", async () => {
    register(
      new Map([
        [
          "luxass/projectrc",
          {
            data: REPOSITORY.projectrc,
            truncated: true,
            files: {
              ".github/projectrc.json": {
                content: {
                  $schema: "https://projectrc.luxass.dev/schema",
                  website: true,
                  workspace: {
                    enabled: true,
                  },
                },
              },
              "package.json": {
                content: {
                  name: "projectrc",
                  private: true,
                  workspaces: [
                    "packages/*",
                  ],
                },
              },
            },
          },
        ],
      ]),
    );

    await expect(() => resolveProjectRC({
      owner: "luxass",
      repository: "projectrc",
      githubToken: "TEST",
    })).rejects.toThrow(
      "projectrc: workspace is enabled, but the file tree is too large.\nWe are not currently supporting this.",
    );
  });

  it("should ignore packages", async () => {
    const PROJECTRC = {
      website: true,
      npm: {
        enabled: true,
      },
      workspace: {
        enabled: true,
        ignores: [
          "packages/package1",
        ],
      },
    } satisfies Input<typeof SCHEMA>;

    register(
      new Map([
        [
          "luxass/projectrc",
          {
            data: REPOSITORY.projectrc,
            files: {
              ".github/projectrc.json": {
                content: PROJECTRC,
              },
              "packages/package1/package.json": {
                content: {
                  name: "package1",
                  private: true,
                },
              },
              "packages/package2/package.json": {
                content: {
                  name: "package2",
                  private: true,
                },
              },
              "package.json": {
                content: {
                  name: "projectrc",
                  private: true,
                  workspaces: [
                    "packages/*",
                  ],
                },
              },
            },
          },
        ],
      ]),
    );

    const result = await resolveProjectRC({
      owner: "luxass",
      repository: "projectrc",
      githubToken: "TEST",
    });

    expect(result?.$projectrc).toEqual({
      $gitPath: "https://api.github.com/repos/luxass/projectrc/contents/.github/projectrc.json",
      $path: "https://projectrc.luxass.dev/resolve/projectrc/rc",
      ...PROJECTRC,
    });

    expect(result?.projects).toEqual([
      {
        title: "package2",
        name: "package2",
        description: REPOSITORY.projectrc.description,
        website: "https://projectrc.luxass.dev",
      },
    ]);
  });

  it("should ignore multiple packages", async () => {
    const PROJECTRC = {
      website: true,
      npm: {
        enabled: true,
      },
      workspace: {
        enabled: true,
        ignores: [
          "packages/package1",
          "packages/package2",
        ],
      },
    } satisfies Input<typeof SCHEMA>;

    register(
      new Map([
        [
          "luxass/projectrc",
          {
            data: REPOSITORY.projectrc,
            files: {
              ".github/projectrc.json": {
                content: PROJECTRC,
              },
              "packages/package1/package.json": {
                content: {
                  name: "package1",
                  private: true,
                },
              },
              "packages/package2/package.json": {
                content: {
                  name: "package2",
                  private: true,
                },
              },
              "package.json": {
                content: {
                  name: "projectrc",
                  private: true,
                  workspaces: [
                    "packages/*",
                  ],
                },
              },
            },
          },
        ],
      ]),
    );

    const result = await resolveProjectRC({
      owner: "luxass",
      repository: "projectrc",
      githubToken: "TEST",
    });

    expect(result?.$projectrc).toEqual({
      $gitPath: "https://api.github.com/repos/luxass/projectrc/contents/.github/projectrc.json",
      $path: "https://projectrc.luxass.dev/resolve/projectrc/rc",
      ...PROJECTRC,
    });

    expect(result?.projects).toEqual([]);
  });

  it("should be able to override values", async () => {
    const PROJECTRC = {
      website: true,
      readme: true,
      workspace: {
        enabled: true,
        overrides: [
          {
            name: "package1",
            readme: false,
          },
          {
            name: "package2",
            website: false,
            readme: "/README.md",
            description: "This is a description",
          },
        ],
      },
    } satisfies Input<typeof SCHEMA>;

    register(
      new Map([
        [
          "luxass/projectrc",
          {
            data: REPOSITORY.projectrc,
            files: {
              ".github/projectrc.json": {
                content: PROJECTRC,
              },
              "packages/package1/package.json": {
                content: {
                  name: "package1",
                  private: true,
                },
              },
              "packages/package2/package.json": {
                content: {
                  name: "package2",
                  private: true,
                },
              },
              "packages/package3/package.json": {
                content: {
                  name: "package3",
                  private: true,
                },
              },
              "packages/package3/README.md": {
                content: "# ProjectRC",
              },
              "package.json": {
                content: {
                  name: "projectrc",
                  private: true,
                  workspaces: [
                    "packages/*",
                  ],
                },
              },
              "README.md": {
                content: "# ProjectRC",
              },
            },
          },
        ],
      ]),
    );

    const result = await resolveProjectRC({
      owner: "luxass",
      repository: "projectrc",
      githubToken: "TEST",
    });

    expect(result?.$projectrc).toEqual({
      $gitPath: "https://api.github.com/repos/luxass/projectrc/contents/.github/projectrc.json",
      $path: "https://projectrc.luxass.dev/resolve/projectrc/rc",
      ...PROJECTRC,
    });

    expect(result?.projects).toEqual([
      {
        description: "⚙️ Customize my projects on luxass.dev",
        name: "package1",
        title: "package1",
        website: "https://projectrc.luxass.dev",
      },
      {
        description: "This is a description",
        name: "package2",
        title: "package2",
        readme: {
          content: "# ProjectRC",
          path: "https://api.github.com/repos/luxass/projectrc/contents/README.md",
        },
      },
      {
        description: "⚙️ Customize my projects on luxass.dev",
        name: "package3",
        title: "package3",
        website: "https://projectrc.luxass.dev",
        readme: {
          content: "# ProjectRC",
          path: "https://api.github.com/repos/luxass/projectrc/contents/packages/package3/README.md",
        },
      },
    ]);
  });
});
