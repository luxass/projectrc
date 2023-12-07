import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
} from "vitest";
import { setupServer } from "msw/node";
import {
  getRepository,
  repositoryExists,
} from "../src/repository";
import { repositoryHTTPHandler } from "./__handlers__/repository.http";
import { repositoryGraphQLHandler } from "./__handlers__/repository.graphql";

const server = setupServer(
  repositoryHTTPHandler,
  repositoryGraphQLHandler,
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => GitHubMockedData.clear());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("expect `luxass/projectrc` to exist", async () => {
  register(new Map([["luxass/projectrc", {

  }]]));
  const result = await repositoryExists({
    owner: "luxass",
    repository: "projectrc",
  });

  expect(result).toBeDefined();
  expect(result).toBeTruthy();
});

it("expect `luxass/luxass.dev` to not exist", async () => {
  const result = await repositoryExists({
    owner: "luxass",
    repository: "luxass.dev",
  });

  expect(result).toBeDefined();
  expect(result).toBeFalsy();
});

it("expect `luxass/projectrc` to return data", async () => {
  register(new Map([
    ["luxass/projectrc", {
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
    }],
  ]));

  const result = await getRepository({
    owner: "luxass",
    repository: "projectrc",
    githubToken: "TEST",
  });

  expect(result).toBeDefined();
  expect(result).toBeTypeOf("object");
  expect(result.name).toBe("projectrc");
});

it("expect `luxass/luxass.dev` to return nothing", async () => {
  register(new Map([
    ["luxass/projectrc", {
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
    }],
  ]));

  const result = await getRepository({
    owner: "luxass",
    repository: "luxass.dev",
    githubToken: "TEST",
  });

  expect(result).toBeUndefined();
});

it("throw if `githubToken` is not valid", async () => {
  await expect(() => getRepository({
    owner: "luxass",
    repository: "luxass.dev",
    githubToken: "NOT-VALID",
  })).rejects.toThrowError("Bad credentials");
});
