import { graphql } from "@octokit/graphql";
import { gql } from "github-schema";
import type { RepositoryNode } from "github-schema/github-schema";

export interface ExistsOptions {
  owner: string
  repository: string
  githubToken?: string
}

/**
 * Checks whether the given repository exists
 * @param {ExistsOptions} options - The options to use.
 * @returns {Promise<boolean>} Whether the repository exists
 *
 * NOTE: This doesn't check whether the repository is public or private
 *
 * @example
 * ```ts
 * import { repositoryExists } from "@luxass/projectrc";
 *
 * await repositoryExists({
 *  owner: "luxass",
 *  repository: "projectrc",
 * });
 * // true or false based on whether the repository exists
 * ```
 */
export async function repositoryExists(
  options: ExistsOptions,
): Promise<boolean> {
  if (!options.owner || !options.repository) {
    return false;
  }

  const { owner, repository, githubToken } = options;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repository}`,
      {
        headers: {
          ...(githubToken && { Authorization: `bearer ${githubToken}` }),
          "Content-Type": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!res.ok) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

export interface RepositoryOptions {
  /**
   * The owner of the repository
   */
  owner: string

  /**
   * The name of the repository
   */
  repository: string

  /**
   * The GitHub Token to use
   */
  githubToken: string
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

/**
 * Gets the repository node for the given repository
 * @param {RepositoryOptions} options - The options to use
 * @returns {RepositoryNode["repository"] | undefined} The repository node
 *
 * NOTE:
 * This throws if the GitHub Token is not set or something else goes wrong, so make sure to catch it
 * This is not the full response from GitHub, as it only contains the fields we need.
 * To see what we request, you can see the `REPOSITORY_QUERY` export.
 *
 * @example
 * ```ts
 * import { getRepository } from "@luxass/projectrc";
 *
 * const repository = await getRepository({
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
export async function getRepository(
  options: RepositoryOptions,
): Promise<RepositoryNode["repository"] | undefined> {
  if (!options.owner || !options.repository) {
    return undefined;
  }

  if (!options.githubToken) {
    throw new Error("GitHub Token is required");
  }

  const { owner, repository: name, githubToken } = options;

  const { repository } = await graphql<RepositoryNode>(REPOSITORY_QUERY, {
    headers: {
      "Authorization": `bearer ${githubToken}`,
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
