import { Buffer } from "node:buffer";
import { afterAll, afterEach, beforeAll, expect, expectTypeOf, it } from "vitest";
import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import { beforeEach } from "node:test";
import type { Input } from "valibot";
import { getREADME } from "../src/readme";
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
    "0": string
  }>(
    "https://api.github.com/repos/:owner/:name/contents/*",
    async ({ params }) => {
      const files = params["0"];

      if (!params.owner || !params.name || !files) {
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

      const repoFiles = Object.keys(repo);

      if (!repoFiles.includes(files)) {
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

      const project = repo[files];

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
  http.get<{
    owner: string
    name: string
  }>(
    "https://api.github.com/repos/:owner/:name/readme",
    async ({ params }) => {
      if (!params.owner || !params.name) {
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

      if (!files.includes("README.md")) {
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

      const project = repo["README.md"];

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

it("expect to find repository README when `readme: true`", async () => {
  register(
    new Map([
      [
        "luxass/luxass.dev",
        {
          ".projectrc.json": {
            content: {
              readme: true,
            },
          },
          "README.md": {
            content: "**[luxass.dev](https://luxass.dev)**\n"
            + "\n"
            + "built with **[astro](https://astro.build)** 🩵\n"
            + "\n"
            + "<samp>licensed under <a href=\"./LICENSE\">MIT</a></samp>\n",
          },
        },
      ],
    ]),
  );

  const result = await getREADME({
    owner: "luxass",
    repository: "luxass.dev",
  });

  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/luxass.dev/readme",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toBeTypeOf("string");
  expect(result?.content).toBe("**[luxass.dev](https://luxass.dev)**\n"
  + "\n"
  + "built with **[astro](https://astro.build)** 🩵\n"
  + "\n"
  + "<samp>licensed under <a href=\"./LICENSE\">MIT</a></samp>\n");
});

it("expect to find specific repository README when readme is a string", async () => {
  register(
    new Map([
      [
        "luxass/projectrc",
        {
          ".projectrc.json": {
            content: {
              readme: "/packages/projectrc",
            },
          },
          "README.md": {
            content: "# Root README\n\n> This is located in the `root`",
          },
          "packages/README.md": {
            content: "# Packages\n\n> This is located in `packages`",
          },
          "packages/projectrc/README.md": {
            content: "# ProjectRC\n\n> This is located in `packages/projectrc`",
          },
        },
      ],
    ]),
  );

  const result = await getREADME({
    owner: "luxass",
    repository: "projectrc",
    readmePath: "packages/projectrc",
  });

  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/projectrc/contents/packages/projectrc/README.md",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toBeTypeOf("string");
  expect(result?.content).toBe("# ProjectRC\n\n> This is located in `packages/projectrc`");
});
