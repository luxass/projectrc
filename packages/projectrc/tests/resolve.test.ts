import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { setupServer } from "msw/node";
import {
  resolveProjectRC,
} from "../src/resolve";
import { contentsHTTPHandler } from "./__handlers__/contents.http";
import { repositoryGraphQLHandler } from "./__handlers__/repository.graphql";
import { repositoryHTTPHandler } from "./__handlers__/repository.http";

const server = setupServer(
  contentsHTTPHandler,
  repositoryHTTPHandler,
  repositoryGraphQLHandler,
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

it("should handle monorepo with workspaces and ignore specified packages", async () => {
  register(
    new Map([
      [
        "luxass/projectrc",
        {
          data: {
            name: "projectrc",
            homepageUrl: "https://projectrc.luxass.dev",
            isFork: false,
            isPrivate: false,
            nameWithOwner: "luxass/projectrc",
            description: "⚙️ Customize my projects on luxass.dev",
            pushedAt: "2023-12-06T20:01:46Z",
            url: "https://github.com/luxass/projectrc",
            defaultBranchRef: {
              name: "main",
            },
            languages: {
              nodes: [
                {
                  name: "TypeScript",
                  color: "#3178c6",
                },
              ],
            },
          },
          files: {
            ".github/projectrc.json": {
              content: {

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

  console.log(result);

  expect(result).toBeDefined();
});
