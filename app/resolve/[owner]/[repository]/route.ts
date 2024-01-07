import { env } from "~/env.mjs";
import { resolveConfig } from "~/lib/config";
import { getREADME } from "~/lib/readme";
import { getRepository, getRepositoryType } from "~/lib/repository";
import type { ProjectRCResponse } from "~/lib/types";
import { base64ToString } from "~/lib/utils";
import { resolveWorkspaceProjects } from "~/lib/workspace";

export const revalidate = 3600;

interface RouteParams {
  owner: string
  repository: string
}

export async function GET(
  _: Request,
  { params }: { params: RouteParams },
) {
  const { owner, repository: repositoryName } = params;

  const repositoryType = await getRepositoryType(owner, repositoryName);

  if (!repositoryType) {
    return Response.json({
      error: "repository not found",
    }, {
      status: 404,
    });
  }

  if (repositoryType !== "public") {
    return Response.json({
      error: "repository is not public",
    }, {
      status: 403,
    });
  }

  if (owner !== "luxass") {
    return Response.json({
      error: "repository is not owned by luxass",
    }, {
      status: 403,
    });
    // resolve repository externally in my luxass/luxass repo
  }

  const config = await resolveConfig(owner, repositoryName);

  if (!config) {
    return Response.json({
      error: "repository has no config",
    }, {
      status: 404,
    });
  }

  const repository = await getRepository(owner, repositoryName);

  if (!repository) {
    return Response.json({
      error: "repository not found",
    }, {
      status: 404,
    });
  }

  const { content: $raw } = config;

  if ($raw.ignore) {
    return Response.json({
      error: `repository ${repositoryName} is ignored`,
    }, {
      status: 403,
    });
  }

  const result: ProjectRCResponse = {
    $projectrc: {
      ...$raw,
      $gitPath: config.path,
      $path: `https://projectrc.luxass.dev/resolve/${repositoryName}/config`,
    },
    projects: [],
  };

  if ($raw.workspace && $raw.workspace.enabled) {
    const resolvedProjects = await resolveWorkspaceProjects(owner, repositoryName, $raw, repository);
    result.projects.push(...resolvedProjects);
  } else {
    const project: ProjectRCResponse["projects"][number] = {
      description: $raw.description || repository.description || undefined,

      name: repository.name,
    };

    if ($raw.website) {
      project.website
        = typeof $raw.website === "string"
          ? $raw.website
          : repository.homepageUrl || null;
    }

    if ($raw.readme) {
      const readme = await getREADME({
        owner,
        repository: repositoryName,
        readmePath: $raw.readme,
      });

      if (readme) {
        project.readme = readme;
      }
    }

    if ($raw.meta) {
      const title = $raw.meta.title || repository.name;
      const description = $raw.meta.description || project.description;
      const keywords = $raw.meta.keywords || [];

      project.meta = {
        title,
        description,
        keywords,
      };
    }

    if ($raw.extras) {
      project.extras ||= {};
      const extras = $raw.extras;

      if (extras.stars) {
        project.extras.stars = repository.stargazerCount;
      }

      if (extras.version) {
        const result = await fetch(`https://api.github.com/repos/${owner}/${repositoryName}/releases/latest`).then((res) => res.json());

        if (!result || typeof result !== "object" || !("tag_name" in result) || typeof result.tag_name !== "string") {
          throw new Error(
            "projectrc: version is enabled, but no `tag_name` field was found in the GitHub API response.\nPlease try again later.",
          );
        }

        project.extras.version = {
          tag: result.tag_name,
          url: `https://github.com/${owner}/${repositoryName}/releases/latest`,
        };
      }

      if (extras.deprecated) {
        project.extras.deprecated = extras.deprecated;
      }

      if (extras.npm) {
        let npm = extras.npm;
        if (typeof npm === "boolean") {
          npm = {
            enabled: true,
            downloads: true,
          };
        }

        if (npm.enabled) {
          if (npm.name) {
            project.extras.npm = {
              name: npm.name,
              url: `https://www.npmjs.com/package/${npm.name}`,
            };
          } else {
            const pkgResult = await fetch(
              `https://api.github.com/repos/${owner}/${repositoryName}/contents/package.json`,
              {
                headers: {
                  "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
                  "Content-Type": "application/vnd.github+json",
                  "X-GitHub-Api-Version": "2022-11-28",
                },
              },
            ).then((res) => res.json());

            if (
              !pkgResult
              || typeof pkgResult !== "object"
              || !("content" in pkgResult)
              || typeof pkgResult.content !== "string"
            ) {
              throw new Error(
                "projectrc: npm is enabled, but no `package.json` file was found.\nPlease add a `package.json` file to the root of your repository.",
              );
            }

            const pkg: unknown = JSON.parse(base64ToString(pkgResult.content));

            if (
              !pkg
              || typeof pkg !== "object"
              || !("name" in pkg)
              || typeof pkg.name !== "string"
            ) {
              throw new Error(
                "projectrc: npm is enabled, but no `name` field was found in your `package.json` file.\nPlease add a `name` field to your `package.json` file.",
              );
            }

            project.extras.npm = {
              name: pkg.name,
              url: `https://www.npmjs.com/package/${pkg.name}`,
            };

            if (npm.downloads && project.extras.npm.name) {
              const result = await fetch(`https://api.npmjs.org/downloads/point/last-month/${project.extras.npm.name}`).then((res) => res.json());

              if (!result || typeof result !== "object" || !("downloads" in result) || typeof result.downloads !== "number") {
                throw new Error(
                  "projectrc: npm.downloads is enabled, but no `downloads` field was found in the npm API response.\nPlease try again later.",
                );
              }

              project.extras.npm.downloads = result.downloads;
            }
          }
        }
      }
    }

    result.projects.push(project);
  }

  return Response.json(result);
}
