import { graphql } from "@octokit/graphql";
import type { Repository, User } from "github-schema";
import type { Project } from "./types";
import { PROFILE_QUERY, REPOSITORY_QUERY } from "./graphql";
import { SITE_URL } from "./utils";
import { getRepositoryProjects } from "./repository-projects";
import { getExternalRepositories } from "./repository";

export async function getProjects(): Promise<Project[] | undefined> {
  const { viewer } = await graphql<{
    viewer: Omit<User, "repositoriesContributedTo"> & {
      contributions: User["repositoriesContributedTo"];
    };
  }>(PROFILE_QUERY, {
    headers: {
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!viewer.repositories.nodes?.length) {
    return undefined;
  }

  const projects: Project[] = [];

  const ignoreFile = await fetch("https://raw.githubusercontent.com/luxass/luxass/main/.github/mosaic/.mosaicignore").then((res) => res.text());
  const ignore = ignoreFile.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));

  const repositories = viewer.repositories.nodes.filter((repo): repo is NonNullable<Repository> => {
    return (
      !!repo
      && !repo.isFork
      && !repo.isPrivate
      && !repo.isArchived
      && !ignore.includes(repo.nameWithOwner)
      && !ignore.includes(repo.nameWithOwner.split("/")[1])
    );
  });

  for await (const file of getExternalRepositories()) {
    if (file.endsWith("README.md") || file.endsWith(".mosaicignore")) continue;

    const [owner, name] = file.replace(".github/mosaic/", "").split("/");

    const { repository } = await graphql<{
      repository: Repository;
    }>(REPOSITORY_QUERY, {
      owner,
      name: name.replace(".toml", ""),
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    repositories.push(repository);
  }

  await Promise.all(
    repositories.map(async (repository) => {
      const [owner, name] = repository.nameWithOwner.split("/");
      const resolved = await getRepositoryProjects(owner, name);

      if (!resolved || !Array.isArray(resolved)) {
        console.warn("invalid response from resolve api", `${SITE_URL}/api/v1/resolve/${repository.nameWithOwner}`);
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

      for (const project of resolved) {
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

  return projects;
}
