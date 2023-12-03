import { Buffer } from "node:buffer";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import { beforeEach } from "node:test";
import type { Input } from "valibot";
import { resolveConfig } from "../src/config";
import type { SCHEMA } from "../src/schema";

interface ProjectRCFile {
  content: Input<typeof SCHEMA> | string
}

const GITHUB_MOCKED_FILES: Map<string, Record<string, ProjectRCFile>> = new Map(
  [],
);

function register(map: typeof GITHUB_MOCKED_FILES) {
  for (const [key, value] of map) {
    GITHUB_MOCKED_FILES.set(key, value);
  }
}

export const handlers = [
  http.get<{
    owner: string
    name: string
    file: string
  }>(
    "https://api.github.com/repos/:owner/:name/contents/.github/:file",
    async ({ params }) => {
      if (!params.owner || !params.name || !params.file) {
        return HttpResponse.json(
          {
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/repos/contents#get-repository-content",
          },
          {
            status: 404,
          },
        );
      }

      await delay();

      const repo = GITHUB_MOCKED_FILES.get(`${params.owner}/${params.name}`);

      if (!repo) {
        return HttpResponse.json(
          {
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/repos/contents#get-repository-content",
          },
          {
            status: 404,
          },
        );
      }

      const files = Object.keys(repo);

      if (!files.includes(params.file)) {
        return HttpResponse.json(
          {
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/repos/contents#get-repository-content",
          },
          {
            status: 404,
          },
        );
      }

      const project = repo[params.file];

      if (!project) {
        return HttpResponse.json(
          {
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/repos/contents#get-repository-content",
          },
          {
            status: 404,
          },
        );
      }

      const content
        = typeof project.content === "object"
          ? JSON.stringify(project.content)
          : project.content;

      return HttpResponse.json({
        content: Buffer.from(content).toString("base64"),
      });
    },
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
beforeEach(() => GITHUB_MOCKED_FILES.clear());
afterEach(() => server.resetHandlers());

it("expect `luxass/lesetid` to have a `.projectrc.json`", async () => {
  register(
    new Map([
      [
        "luxass/lesetid",
        {
          ".projectrc.json": {
            content: {
              handles: [
                "/lesetid",
              ],
              npm: true,
              readme: true,
              website: true,
            },
          },
        },
      ],
    ]),
  );
  const result = await resolveConfig({
    owner: "luxass",
    repository: "lesetid",
    githubToken: "test",
  });
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/.projectrc.json",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toStrictEqual({
    handles: [
      "/lesetid",
    ],
    npm: true,
    readme: true,
    website: true,
  });
});

it("should return next in list", async () => {
  register(
    new Map([
      [
        "luxass/lesetid",
        {
          ".projectrc.json": {
            content: {
              handles: [
                "/lesetid",
              ],
            },
          },
          ".projectrc.json5": {
            content: {
              npm: true,
              readme: true,
            },
          },
        },
      ],
    ]),
  );
  const result = await resolveConfig({
    owner: "luxass",
    repository: "lesetid",
    githubToken: "test",
  });
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/.projectrc.json",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toHaveProperty("handles", ["/lesetid"]);
});

it("should return contents of `.projectrc.json5` when first two isn't there", async () => {
  register(
    new Map([
      [
        "luxass/lesetid",
        {
          ".projectrc.json5": {
            content: {
              npm: true,
              readme: true,
            },
          },
        },
      ],
    ]),
  );
  const result = await resolveConfig({
    owner: "luxass",
    repository: "lesetid",
    githubToken: "test",
  });
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/.projectrc.json5",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toHaveProperty("npm", true);
  expect(result?.content).toHaveProperty("readme", true);
});

it("should return `undefined` when none of the config files exist", async () => {
  register(new Map([["luxass/lesetid", {}]]));
  const result = await resolveConfig({
    owner: "luxass",
    repository: "lesetid",
    githubToken: "test",
  });
  expect(result).toBe(undefined);
});
