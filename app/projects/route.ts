import process from "process";
import type { Language, Repository, User } from "github-schema";
import { gql } from "github-schema";
import { graphql } from "@octokit/graphql";
import { env } from "~/env.mjs";
import type { ProjectRCResponse } from "~/lib/types";

export const revalidate = 3600;

const REPOS_TO_IGNORE: string[] = [".github"];

const URL
  = process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://projectrc.luxass.dev"
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000";

const PROFILE_QUERY = gql`
  #graphql
  query getProfile {
    viewer {
      repositories(
        first: 100
        isFork: false
        privacy: PUBLIC
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        totalCount
        nodes {
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
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      contributions: repositoriesContributedTo(
        privacy: PUBLIC
        first: 100
        contributionTypes: [
          COMMIT
          ISSUE
          PULL_REQUEST
          REPOSITORY
          PULL_REQUEST_REVIEW
        ]
      ) {
        nodes {
          nameWithOwner
        }
      }
    }
  }
`;

type Project = Pick<
  Repository,
  "name" | "nameWithOwner" | "description" | "pushedAt" | "url"
> & {
  $projectrc?: ProjectRCResponse["$projectrc"]
  $values?: ProjectRCResponse["projects"][number]
  language?: Pick<Language, "name" | "color">
  defaultBranch?: string
  isContributor: boolean
};

export async function GET() {
  const { viewer } = await graphql<{
    viewer: Omit<User, "repositoriesContributedTo"> & {
      contributions: User["repositoriesContributedTo"]
    }
  }>(PROFILE_QUERY, {
    headers: {
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!viewer.repositories.nodes?.length) {
    return Response.json({
      error: `no repositories found for ${viewer.login}`,
    }, {
      status: 404,
    });
  }

  const projects: Project[] = [];

  const repositories = viewer.repositories.nodes.filter(
    (repo): repo is NonNullable<Repository> => {
      return (
        !!repo
        && !repo.isFork
        && !repo.isPrivate
        && !REPOS_TO_IGNORE.includes(repo.nameWithOwner)
        && !REPOS_TO_IGNORE.includes(repo.nameWithOwner.split("/")[1])
      );
    },
  );

  await Promise.all(repositories.map(async (repository) => {
    // console.info(`fetching .projectrc for ${repository.nameWithOwner}`);

    const projectRC: ProjectRCResponse = await fetch(
      `${URL}/resolve/${repository.nameWithOwner}`,
    ).then((res) => res.json());

    if (!projectRC || typeof projectRC !== "object" || "error" in projectRC) {
      return;
    }

    let language = {
      name: "Unknown",
      color: "#333",
    };

    const isContributor
      = viewer.contributions.nodes?.some(
        (contribution) =>
          contribution?.nameWithOwner === repository.nameWithOwner,
      ) ?? false;

    if (repository.languages?.nodes?.length && repository.languages.nodes[0]) {
      language = {
        name: repository.languages.nodes[0].name,
        color: repository.languages.nodes[0].color || "#333",
      };
    }

    if (!projectRC) {
      return;
    }

    for (const project of projectRC.projects) {
      projects.push({
        name: project.name,
        nameWithOwner: repository.nameWithOwner,
        description: project.description || repository.description,
        pushedAt: repository.pushedAt,
        url: repository.url,
        defaultBranch: repository.defaultBranchRef?.name || undefined,
        isContributor,
        language,
        $projectrc: projectRC.$projectrc,
        $values: project,
      });
    }
  }));

  return Response.json({
    last: new Date().toISOString(),
    projects,
  });
}
