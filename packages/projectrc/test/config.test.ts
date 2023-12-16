import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { resolveConfig } from "../src/config";
import { contentsHTTPHandler } from "./__handlers__/contents.http";

const server = setupServer(contentsHTTPHandler);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => GitHubMockedData.clear());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("expect `luxass/lesetid` to have a `projectrc.json`", async () => {
  register(
    new Map([
      [
        "luxass/lesetid",
        {
          files: {
            ".github/projectrc.json": {
              content: {
                npm: {
                  enabled: true,
                },
                readme: true,
                website: true,
              },
            },
          },
        },
      ],
    ]),
  );
  const result = await resolveConfig({
    owner: "luxass",
    repository: "lesetid",
  });
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/projectrc.json",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toStrictEqual({
    npm: {
      enabled: true,
    },
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
          files: {
            ".github/projectrc.json5": {
              content: {
                readme: true,
              },
            },
            ".github/projectrc.json": {
              content: {
                npm: {
                  enabled: true,
                },
                readme: false,
              },
            },
          },
        },
      ],
    ]),
  );
  const result = await resolveConfig({
    owner: "luxass",
    repository: "lesetid",
  });
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/projectrc.json",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toHaveProperty("readme", false);
});

it("should return contents of `projectrc.json5` when first two isn't there", async () => {
  register(
    new Map([
      [
        "luxass/lesetid",
        {
          files: {
            ".github/projectrc.json5": {
              content: {
                npm: {
                  enabled: true,
                },
                readme: true,
              },
            },
          },
        },
      ],
    ]),
  );
  const result = await resolveConfig({
    owner: "luxass",
    repository: "lesetid",
  });
  expect(result).toBeDefined();
  expect(result?.path).toBe(
    "https://api.github.com/repos/luxass/lesetid/contents/.github/projectrc.json5",
  );
  expect(result?.content).toBeDefined();
  expect(result?.content).toHaveProperty("npm", { enabled: true });
  expect(result?.content).toHaveProperty("readme", true);
});

it("should return `undefined` when none of the config files exist", async () => {
  register(new Map([["luxass/lesetid", {}]]));
  const result = await resolveConfig({
    owner: "luxass",
    repository: "lesetid",
  });
  expect(result).toBe(undefined);
});
