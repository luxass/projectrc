import process from "node:process";
import { graphql } from "@octokit/graphql";
import type { RepositoryNode } from "~/types";

export const PROJECTRC_NAMES: string[] = [".projectrc", ".projectrc.json"];
export const ALLOWED_OWNERS: string[] = ["luxass"];
export const BLOCKED_REPOSITORIES: string[] = [];

export function gql(raw: TemplateStringsArray, ...keys: string[]): string {
  return keys.length === 0 ? raw[0]! : String.raw({ raw }, ...keys);
}

export const REPOSITORY_QUERY = gql`
  #graphql
  query getRepository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
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
      object(expression: "HEAD:.github") {
        ... on Tree {
          entries {
            name
            type
            path
          }
        }
      }
    }
  }
`;

export async function isExistingRepository(owner: string, name: string): Promise<boolean> {
  try {
    await $fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: {
        "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (err) {
    return false;
  }
}

export async function getRepository(owner: string, name: string): Promise<RepositoryNode> {
  const { repository } = await graphql<{
    repository: RepositoryNode
  }>(REPOSITORY_QUERY, {
    owner,
    name,
    headers: {
      "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  return repository;
}
