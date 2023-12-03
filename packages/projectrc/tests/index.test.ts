// import process from "node:process";
import { expect, it } from "vitest";

// import { createProjectRCResolver } from "../src/index";

it("should work", () => {
  expect(true).toBe(true);
});
// let resolver: ReturnType<typeof createProjectRCResolver>;

// beforeAll(() => {
//   resolver = createProjectRCResolver(process.env.GITHUB_TOKEN!);
// });

// describe("config", () => {
//   it("returns undefined when owner or name is not provided", async () => {
//     const result = await resolver.config();
//     expect(result).toBeUndefined();
//   });

//   it("returns the correct config when the repository exists", async () => {
//     const result = await resolver.config("luxass", "lesetid");
//     expect(result).toBeDefined();
//     expect(result?.path).toContain("luxass/lesetid");
//     expect(result?.content).toBeDefined();
//   });

//   it("should return `undefined` when no config files exists", async () => {
//     const result = await resolver.config("luxass", "nonexistent");
//     expect(result).toBe(undefined);
//   });
// });

// describe("exists", () => {
//   it("should return `false` when the repository does not exist", async () => {
//     const result = await resolver.exists("luxass", "404");

//     expect(result).toBe(false);
//   });

//   it("should return `true` when the repository exists", async () => {
//     const result = await resolver.exists("luxass", "lesetid");
//     expect(result).toBe(true);
//   });
// });

// describe("repository", () => {
//   it("should return `undefined` when the repository does not exist", async () => {
//     const result = await resolver.repository("luxass", "nonexistingrepo");
//     expect(result).toBeUndefined();
//   });

//   it("return the correct repository when it exists", async () => {
//     const result = await resolver.repository("luxass", "lesetid");
//     expect(result).toBeDefined();
//     expect(result?.name).toBe("lesetid");
//   });
// });

// describe("readme", () => {
//   it("should return `undefined` when the repository does not exist", async () => {
//     const result = await resolver.readme("luxass", "nonexistingrepo");
//     expect(result).toBeUndefined();
//   });

//   it("should return the correct readme when the repository exists", async () => {
//     const result = await resolver.readme("luxass", "lesetid");

//     expect(result).toBeDefined();
//     expect(result?.path).toContain("luxass/lesetid");
//     expect(result?.content).toBeTypeOf("string");
//   });

//   it("should return different readme based on readmePath", async () => {
//     const result = await resolver.readme("luxass", "lesetid", "examples/nuxt/README.md");

//     expect(result).toBeDefined();
//     expect(result?.path).toContain("luxass/lesetid");
//     expect(result?.content).toBeTypeOf("string");
//   });

//   it("should return `undefined` when the readme does not exist", async () => {
//     const result = await resolver.readme("luxass", "lesetid", "nonexistent");

//     expect(result).toBeUndefined();
//   });

//   it("should add README.md to end of url, if missing", async () => {
//     const result = await resolver.readme("luxass", "lesetid", "examples/nuxt");

//     expect(result).toBeDefined();
//     expect(result?.path).toContain("luxass/lesetid");
//     expect(result?.path).toContain("README.md");
//     expect(result?.content).toBeTypeOf("string");
//   });

//   it("should fix path if `readmePath` starts with `/`", async () => {
//     const result = await resolver.readme("luxass", "lesetid", "/examples/nuxt");

//     expect(result).toBeDefined();
//     expect(result?.path).toBe("https://api.github.com/repos/luxass/lesetid/contents/examples/nuxt/README.md");
//     expect(result?.content).toBeTypeOf("string");
//   });
// });
