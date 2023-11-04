import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { HttpResponse, delay, graphql, http } from "msw";
import { setupServer } from "msw/node";
import type { RepositoryNode } from "github-schema";
import { exists, getRepository } from "../src/utils";

const GITHUB_MOCKED_REPOS: Map<string, Record<string, unknown>> = new Map(
  [
    [
      "luxass/lesetid",
      {
        name: "repo",
        owner: {
          login: "owner",
        },
      },
    ],
  ],
);

type InferMapValue<T> = T extends Map<unknown, infer U> ? U : never;

export const handlers = [
  http.get<{
    owner: string
    name: string
  }>(
    "https://api.github.com/repos/:owner/:name",
    async ({ params }) => {
      if (!params.owner || !params.name) {
        return HttpResponse.json({
          message: "Not Found",
          documentation_url: "https://docs.github.com/rest/repos/repos#get-a-repository",
        }, {
          // @ts-expect-error Something is broken with the types.
          status: 404,
        });
      }

      await delay();

      const repo = GITHUB_MOCKED_REPOS.get(`${params.owner}/${params.name}`);
      if (!repo) {
        return HttpResponse.json({
          message: "Not Found",
          documentation_url: "https://docs.github.com/rest/repos/repos#get-a-repository",
        }, {
          // @ts-expect-error Something is broken with the types.
          status: 404,
        });
      }

      return HttpResponse.json(repo);
    },
  ),
  graphql.query<{
    repository: RepositoryNode
  }, {
    owner: string
    name: string
  }>("getRepository", async ({ variables }) => {
    if (!variables.owner || !variables.name) {
      return HttpResponse.json({
        errors: [
          {
            type: "NOT_FOUND",
            message: "Not Found",
          },
        ],
      }, {
        // @ts-expect-error Something is broken with the types.
        status: 404,
      });
    }

    await delay();

    const repo = GITHUB_MOCKED_REPOS.get(`${variables.owner}/${variables.name}`);
    if (!repo) {
      return HttpResponse.json({
        errors: [
          {
            type: "NOT_FOUND",
            message: "Not Found",
          },
        ],
      }, {
        // @ts-expect-error Something is broken with the types.
        status: 404,
      });
    }

    return HttpResponse.json({
      data: {
        repository: repo as RepositoryNode,
      },
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

test("expect `false` when repo doesn't exist", async () => {
  const result = await exists("nonexistent", "repo");
  expect(result).toBe(false);
});

test("expect `true` when repo exists", async () => {
  const result = await exists("luxass", "lesetid");
  expect(result).toBe(true);
});

test("returns the correct repository when it exists", async () => {
  const result = await getRepository<InferMapValue<typeof GITHUB_MOCKED_REPOS>>("luxass", "lesetid");
  expect(result).toEqual({
    name: "repo",
    owner: {
      login: "owner",
    },
  });
});

test("throws an error when the repository does not exist", async () => {
  await expect(getRepository<InferMapValue<typeof GITHUB_MOCKED_REPOS>>("nonexistent", "repo")).rejects.toThrow();
});
