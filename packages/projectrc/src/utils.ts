import process from "node:process";
import { graphql } from "@octokit/graphql";
import { gql } from "github-schema";
import type { RepositoryNode } from "github-schema";
import { XGitHubApiVersionHeaderValue } from "./constants";

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

/**
 * Checks whether the given repository exists
 * @param {string} owner - The owner of the repository
 * @param {string} name - The name of the repository
 * @returns {Promise<boolean>} Whether the repository exists
 *
 * NOTE: This doesn't check whether the repository is public or private
 */
export async function exists(owner: string, name: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: {
        "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/vnd.github+json",
        "X-GitHub-Api-Version": XGitHubApiVersionHeaderValue,
      },
    });

    if (!res.ok) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Get a repository from GitHub
 * @param {string} owner - The owner of the repository
 * @param {string} name - The name of the repository
 * @returns {Promise<RepositoryNode["repository"]>} The `RepositoryNode` of the repository
 *
 * NOTE: This is not the full response from GitHub, as it only contains the fields we need.
 * To see what we request, you can see the `REPOSITORY_QUERY` export.
 */
export async function getRepository(
  owner: string,
  name: string,
): Promise<RepositoryNode["repository"]> {
  const {
    repository,
  } = await graphql<RepositoryNode>(REPOSITORY_QUERY, {
    owner,
    name,
    headers: {
      "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": XGitHubApiVersionHeaderValue,
    },
  });

  return repository;
}
