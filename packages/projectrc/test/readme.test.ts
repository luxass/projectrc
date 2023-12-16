import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { getREADME } from "../src/readme";
import { readmeHTTPHandler } from "./__handlers__/readme.http";
import { contentsHTTPHandler } from "./__handlers__/contents.http";

const server = setupServer(
  contentsHTTPHandler,
  readmeHTTPHandler,
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => GitHubMockedData.clear());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("expect to find repository README when `readme: true`", async () => {
  register(
    new Map([
      [
        "luxass/luxass.dev",
        {
          files: {
            ".projectrc.json": {
              content: {
                readme: true,
              },
            },
            "README.md": {
              content:
                "**[luxass.dev](https://luxass.dev)**\n"
                + "\n"
                + "built with **[astro](https://astro.build)** 🩵\n"
                + "\n"
                + "<samp>licensed under <a href=\"./LICENSE\">MIT</a></samp>\n",
            },
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
  expect(result?.content).toBe(
    "**[luxass.dev](https://luxass.dev)**\n"
    + "\n"
    + "built with **[astro](https://astro.build)** 🩵\n"
    + "\n"
    + "<samp>licensed under <a href=\"./LICENSE\">MIT</a></samp>\n",
  );
});

it("expect to find specific repository README when readme is a string", async () => {
  register(
    new Map([
      [
        "luxass/projectrc",
        {
          files: {
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
              content:
                "# ProjectRC\n\n> This is located in `packages/projectrc`",
            },
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
  expect(result?.content).toBe(
    "# ProjectRC\n\n> This is located in `packages/projectrc`",
  );
});
