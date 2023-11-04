import { Buffer } from "node:buffer";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import { beforeEach } from "node:test";
import { getProjectRCFile } from "../src/config";

interface ProjectRCFile {
  content: Record<string, unknown> | string
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
        return HttpResponse.json({
          message: "Not Found",
          documentation_url:
            "https://docs.github.com/rest/repos/contents#get-repository-content",
        }, {
          // @ts-expect-error Something is broken with the types.
          status: 404,
        });
      }

      await delay();

      // ONLY HERE TO KIND OF SATISFY TYPESCRIPT
      const owner = Array.isArray(params.owner)
        ? (params.owner[0] as string)
        : (params.owner as string);
      const name = Array.isArray(params.name)
        ? (params.name[0] as string)
        : (params.name as string);
      const file = Array.isArray(params.file)
        ? (params.file[0] as string)
        : (params.file as string);

      const repo = GITHUB_MOCKED_FILES.get(`${owner}/${name}`);

      if (!repo) {
        return HttpResponse.json({
          message: "Not Found",
          documentation_url:
            "https://docs.github.com/rest/repos/contents#get-repository-content",
        }, {
          // @ts-expect-error Something is broken with the types.
          status: 404,
        }); ;
      }

      const files = Object.keys(repo);

      if (!files.includes(file)) {
        return HttpResponse.json({
          message: "Not Found",
          documentation_url:
            "https://docs.github.com/rest/repos/contents#get-repository-content",
        }, {
          // @ts-expect-error Something is broken with the types.
          status: 404,
        });
      }

      const project = repo[file];

      if (!project) {
        return HttpResponse.json({
          message: "Not Found",
          documentation_url:
            "https://docs.github.com/rest/repos/contents#get-repository-content",
        }, {
          // @ts-expect-error Something is broken with the types.
          status: 404,
        });
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
afterEach(() => server.resetHandlers());
beforeEach(() => GITHUB_MOCKED_FILES.clear());

test("expect `luxass/lesetid` to have a `.projectrc`", async () => {
  register(
    new Map([
      [
        "luxass/lesetid",
        {
          ".projectrc": {
            content: {},
          },
        },
      ],
    ]),
  );
  const result = await getProjectRCFile("luxass", "lesetid");
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/.projectrc",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toStrictEqual({});
});

test("should return next in list", async () => {
  register(
    new Map([
      [
        "luxass/lesetid",
        {
          ".projectrc.json": {
            content: {
              file: "json",
            },
          },
          ".projectrc.json5": {
            content: {
              file: "json5",
            },
          },
        },
      ],
    ]),
  );
  const result = await getProjectRCFile("luxass", "lesetid");
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/.projectrc.json",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toHaveProperty("file", "json");
});

test("should return contents of `.projectrc.json5` when first two isn't there", async () => {
  register(
    new Map([
      [
        "luxass/lesetid",
        {
          ".projectrc.json5": {
            content: {
              file: "json5",
            },
          },
        },
      ],
    ]),
  );
  const result = await getProjectRCFile("luxass", "lesetid");
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/.projectrc.json5",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toHaveProperty("file", "json5");
});

test("should return `undefined` when no `.projectrc` exist", async () => {
  register(new Map([["luxass/lesetid", {}]]));
  const result = await getProjectRCFile("luxass", "lesetid");
  expect(result).toBe(undefined);
});
