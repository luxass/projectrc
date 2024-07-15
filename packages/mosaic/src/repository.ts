import { graphql } from "@octokit/graphql";
import type { RepositoryNode } from "github-schema";
import { gql } from "github-schema";

export type RepositoryType = "fork" | "private" | "archived" | "public";

export interface RepositoryTypeOptions {
  owner: string;
  repository: string;
  githubToken?: string;
}

/**
 * Gets the repository type for the given repository
 * @param {RepositoryTypeOptions} options - The options to use
 * @returns {Promise<RepositoryType |>} The repository node
 *
 * NOTE:
 * This throws if the GitHub Token is not set or something else goes wrong, so make sure to catch it
 * This is not the full response from GitHub, as it only contains the fields we need.
 * To see what we request, you can see the `REPOSITORY_QUERY` export.
 *
 * @example
 * ```ts
 * import { getRepositoryType } from "@luxass/mosaic";
 *
 * const repository = await getRepositoryType({
 *   owner: "luxass",
 *   repository: "mosaic",
 *   githubToken: process.env.GITHUB_TOKEN,
 * });
 * // results in: "public"
 * ```
 */
export async function getRepositoryType(options: RepositoryTypeOptions): Promise<RepositoryType | undefined> {
  const { owner, repository, githubToken } = options;
  if (!owner || !repository) {
    return undefined;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repository}`, {
    headers: {
      ...(githubToken != null
        ? {
            Authorization: `Bearer ${githubToken}`,
          }
        : {}),
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    return;
  }

  const data = await res.json();

  if (!data || typeof data !== "object") {
    console.error("Invalid response from GitHub API");
    return;
  }

  if ("fork" in data && data.fork === true) {
    return "fork";
  }

  if ("archived" in data && data.archived === true) {
    return "archived";
  }

  if ("private" in data && data.private === false) {
    return "public";
  }

  // always return private, if we can't determine the type
  return "private";
}

const REPOSITORY_QUERY = gql`
  #graphql
  query getRepository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      homepageUrl
      isFork
      isPrivate
      nameWithOwner
      description
      pushedAt
      url
      defaultBranchRef {
        name
      }
      stargazerCount
      languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
        nodes {
          name
          color
        }
      }
    }
  }
`;

export interface RepositoryOptions {
  owner: string;
  repository: string;
  githubToken?: string;
}

export async function getRepository(options: RepositoryOptions): Promise<RepositoryNode["repository"] | undefined> {
  const { owner, repository: repositoryName, githubToken } = options;
  if (!owner || !repositoryName) {
    return undefined;
  }

  const { repository } = await graphql<RepositoryNode>(REPOSITORY_QUERY, {
    headers: {
      ...(githubToken != null
        ? {
            Authorization: `Bearer ${githubToken}`,
          }
        : {}),
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    name: repositoryName,
    owner,
  });

  // to prevent returning null from the query
  if (!repository) {
    return undefined;
  }

  return repository;
}

export interface ExternalRepositoriesOptions {
  githubToken?: string;
  username: string;
  repo: string;
  path?: string;
}

/**
 * Asynchronous generator function that yields file paths from a GitHub repository.
 *
 * @param {ExternalRepositoriesOptions} options - Configuration options for the function.
 * @yields {string} The path of each file in the specified repository and path.
 * @throws {TypeError} If the response from GitHub is invalid.
 * @throws {Error} If there's an error fetching files from GitHub.
 *
 * @example
 * ```typescript
 * async function main() {
 *   const options = {
 *     username: 'octocat',
 *     repo: 'Hello-World',
 *     githubToken: 'ghp_yourPersonalAccessTokenHere', // Optional
 *     path: 'docs' // Optional, defaults to '.github/mosaic'
 *   };
 *
 *   try {
 *     const generator = getExternalRepositories(options);
 *     for await (const filePath of generator) {
 *       console.log(`Found file: ${filePath}`);
 *     }
 *   } catch (error) {
 *     console.error('Error:', error.message);
 *   }
 * }
 *
 * main();
 * ```
 *
 * @example
 * ```ts
 * import { getExternalRepositories } from "@luxass/mosaic";
 *
 * try {
 *   const generator = getExternalRepositories({
 *     username: 'octocat',
 *     repo: 'Hello-World',
 *     githubToken: 'ghp_yourPersonalAccessTokenHere', // Optional
 *   });
 *   for await (const filePath of generator) {
 *     console.log(`Found file: ${filePath}`);
 *   }
 * } catch (error) {
 *   console.error('Error:', error.message);
 * }
 * ```
 */
export async function* getExternalRepositories(options: ExternalRepositoriesOptions): AsyncGenerator<string> {
  const {
    githubToken,
    username,
    repo,
    path = ".github/mosaic",
  } = options;

  try {
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
    const headers: HeadersInit = {
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type === "file") {
          yield item.path;
        } else if (item.type === "dir") {
          yield * getExternalRepositories({
            ...options,
            path: item.path,
          });
        }
      }
    } else {
      throw new TypeError("Invalid response from GitHub");
    }
  } catch (error: any) {
    console.error("Error fetching files from GitHub:", error.message);
    throw error;
  }
}
