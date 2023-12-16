import { vi } from "vitest";
import type { Input } from "valibot";
import type { SCHEMA } from "../src/schema";

interface GitFile {
  content: string | Input<typeof SCHEMA> & Record<string, unknown>
}

type GitHubRepoFiles = Record<string, GitFile>;

interface GitHubRepo {
  data?: Record<string, unknown>
  truncated?: boolean
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
