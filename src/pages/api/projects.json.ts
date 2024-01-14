import { graphql } from "@octokit/graphql";
import type { APIRoute } from "astro";
import type { Repository, User } from "github-schema";
import { gql } from "github-schema";
import { internalResolve } from "~/lib/resolve";
import type { Project } from "~/lib/types";
import { SITE_URL } from "~/lib/utils";

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

export const GET: APIRoute = async () => {
  const { viewer } = await graphql<{
    viewer: Omit<User, "repositoriesContributedTo"> & {
      contributions: User["repositoriesContributedTo"]
    }
  }>(PROFILE_QUERY, {
    headers: {
      "Authorization": `Bearer ${import.meta.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!viewer.repositories.nodes?.length) {
    return Response.json(
      {
        error: `no repositories found for ${viewer.login}`,
      },
      {
        status: 404,
      },
    );
  }

  const projects: Project[] = [];

  const ignoreFile = await fetch("https://raw.githubusercontent.com/luxass/luxass/main/.github/projectrc/.projectignore").then((res) => res.text());
  const ignore = ignoreFile.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));

  const repositories = viewer.repositories.nodes.filter((repo): repo is NonNullable<Repository> => {
    return (
      !!repo
      && !repo.isFork
      && !repo.isPrivate
      && !ignore.includes(repo.nameWithOwner)
      && !ignore.includes(repo.nameWithOwner.split("/")[1])
    );
  });

  await Promise.all(
    repositories.map(async (repository) => {
      const [owner, name] = repository.nameWithOwner.split("/");
      const resolved: unknown = await internalResolve(owner, name).then((res) => res.json());

      if (!resolved || typeof resolved !== "object" || !("projects" in resolved) || !Array.isArray(resolved.projects)) {
        console.warn("invalid response from resolve api", `${SITE_URL}/api/resolve/${repository.nameWithOwner}`);
        return;
      }

      let language = {
        name: "Unknown",
        color: "#333",
      };

      const isContributor
        = viewer.contributions.nodes?.some((contribution) => contribution?.nameWithOwner === repository.nameWithOwner)
        ?? false;

      if (repository.languages?.nodes?.length && repository.languages.nodes[0]) {
        language = {
          name: repository.languages.nodes[0].name,
          color: repository.languages.nodes[0].color || "#333",
        };
      }

      for (const project of resolved.projects) {
        projects.push({
          ...project,

          // extra fields
          nameWithOwner: repository.nameWithOwner,
          pushedAt: repository.pushedAt,
          url: repository.url,
          defaultBranch: repository.defaultBranchRef?.name || undefined,
          isContributor,
          language,
        });
      }
    }),
  );

  return Response.json(
    {
      modified: new Date().toISOString(),
      projects,
    },
    {
      headers: {
        "Cache-Control": "max-age=3600",
        "Content-Disposition": "inline",
      },
    },
  );
};
