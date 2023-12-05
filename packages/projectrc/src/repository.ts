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
 * import { exists } from "@luxass/projectrc";
 *
 * await exists({
 *  owner: "luxass",
 *  repository: "projectrc",
 * });
 * // true or false based on whether the repository exists
 * ```
 */
export async function exists(options: ExistsOptions): Promise<boolean> {
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
  owner: string
  repository: string
  githubToken: string
}

export const REPOSITORY_QUERY = gql`
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
      languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
        nodes {
          name
          color
        }
      }
    }
  }
`;

export async function repository(
  options: RepositoryOptions,
): Promise<RepositoryNode["repository"] | undefined> {
  if (!options.owner || !options.repository) {
    return undefined;
  }

  const { owner, repository: name, githubToken } = options;

  try {
    const { repository } = await graphql<RepositoryNode>(REPOSITORY_QUERY, {
      headers: {
        "Authorization": `bearer ${githubToken}`,
        "Content-Type": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      name,
      owner,
    });

    return repository;
  } catch (err) {
    return undefined;
  }
}
