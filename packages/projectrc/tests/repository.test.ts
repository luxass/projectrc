import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { exists } from "../src/utils";
import { repositoryHandlers } from "./__handlers__/repository.handler";

export const handlers = [
  ...(repositoryHandlers),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => GitHubMockedData.clear());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("expect `luxass/projectrc` to exist", async () => {
  register(new Map([["luxass/projectrc", {}]]));

  const result = await exists({
    owner: "luxass",
    repository: "projectrc",
  });

  expect(result).toBeDefined();
  expect(result).toBeTruthy();
});

it("expect `luxass/projectrc` to not exist", async () => {
  const result = await exists({
    owner: "luxass",
    repository: "projectrc",
  });

  expect(result).toBeDefined();
  expect(result).toBeFalsy();
});
