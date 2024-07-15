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
 *   repository: "projectrc",
 *   githubToken: process.env.GITHUB_TOKEN,
 * });
 * // results in:
 * // {
 * //   name: "projectrc",
 * //   GITHUB RESPONSE...
 * // }
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

export async function getRepository(owner: string, name: string): Promise<RepositoryNode["repository"] | undefined> {
  if (!owner || !name) {
    return undefined;
  }

  const { repository } = await graphql<RepositoryNode>(REPOSITORY_QUERY, {
    headers: {
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    name,
    owner,
  });

  // to prevent returning null from the query
  if (!repository) {
    return undefined;
  }

  return repository;
}

export async function* getExternalRepositories(path: string = ".github/mosaic"): AsyncGenerator<string> {
  try {
    const data = await fetch(`https://api.github.com/repos/luxass/luxass/contents/${path}`, {
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }).then((res) => res.json());
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type === "file") {
          yield item.path;
        } else if (item.type === "dir") {
          yield * getExternalRepositories(item.path);
        }
      }
    } else {
      throw new TypeError("invalid response from github");
    }
  } catch (error: any) {
    console.error("Error fetching files from GitHub:", error.message);
    throw error;
  }
}
