import { vi } from "vitest";
import type { Input } from "valibot";
import type { SCHEMA } from "../src/schema";

interface ProjectRCFile {
  content: Input<typeof SCHEMA> | string
}

type GitHubRepoFiles = Record<string, ProjectRCFile>;

interface GitHubRepo {
  data?: Record<string, unknown>
  files?: GitHubRepoFiles
}

type GitHubRepoMap = Map<string, GitHubRepo>;

const GitHubMockedData: GitHubRepoMap = new Map();

function register(map: GitHubRepoMap) {
  for (const [key, value] of map) {
    GitHubMockedData.set(key, value);
  }
}

vi.stubGlobal("GitHubMockedData", GitHubMockedData);
vi.stubGlobal("register", register);

declare global {
  const GitHubMockedData: GitHubRepoMap;

  function register(map: GitHubRepoMap): void;
}
