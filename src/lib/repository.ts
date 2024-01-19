import { graphql } from "@octokit/graphql"
import type { RepositoryNode } from "github-schema"
import { gql } from "github-schema"

export type RepositoryType = "fork" | "private" | "archived" | "public"

export interface RepositoryTypeOptions {
  owner: string
  name: string
}

export async function getRepositoryType(owner: string, repository: string): Promise<RepositoryType | undefined> {
  if (!owner || !repository) {
    return undefined
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repository}`, {
    headers: {
      "Authorization": `Bearer ${import.meta.env.GITHUB_TOKEN}`,
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })

  if (!res.ok) {
    return
  }

  const data = await res.json()

  if (!data || typeof data !== "object") {
    console.error("Invalid response from GitHub API")
    return
  }

  if ("fork" in data && data.fork === true) {
    return "fork"
  }

  if ("archived" in data && data.archived === true) {
    return "archived"
  }

  if ("private" in data && data.private === false) {
    return "public"
  }

  // always return private, if we can't determine the type
  return "private"
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
`

export async function getRepository(owner: string, name: string): Promise<RepositoryNode["repository"] | undefined> {
  if (!owner || !name) {
    return undefined
  }

  const { repository } = await graphql<RepositoryNode>(REPOSITORY_QUERY, {
    headers: {
      "Authorization": `Bearer ${import.meta.env.GITHUB_TOKEN}`,
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    name,
    owner,
  })

  // to prevent returning null from the query
  if (!repository) {
    return undefined
  }

  return repository
}
