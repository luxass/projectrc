import ignore from "ignore";
import { minimatch } from "minimatch";
import { z } from "zod";
import type { Repository } from "github-schema";
import type { ProjectRCProject } from "./types";
import { base64ToString } from "./utils";
import type { ResolveConfigResult } from "./config";
import { getREADME } from "./readme";
import { env } from "~/env.mjs";

const GITHUB_TREE_SCHEMA = z
  .array(
    z.object({
      // according to the GitHub API docs, this is optional..
      // https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28#get-a-tree
      path: z.string(),
      mode: z.string().optional(),
      type: z.string().optional(),
      sha: z.string().optional(),
      size: z
        .number()
        .int()
        .optional(),
      url: z.string().optional(),
    }),
  );

export async function resolveWorkspaceProjects(owner: string, name: string, $raw: ResolveConfigResult["content"], repository: Repository): Promise<ProjectRCProject[]> {
  const pkgResult = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/package.json`,
    {
      headers: {
        "Authorization": `bearer ${env.GITHUB_TOKEN}`,
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
      "projectrc: workspace is enabled, but no `package.json` file was found.\nPlease add a `package.json` file to the root of your repository.",
    );
  }

  const pkg: unknown = JSON.parse(base64ToString(pkgResult.content));

  if (
    !pkg
    || typeof pkg !== "object"
    || !("workspaces" in pkg)
    || !Array.isArray(pkg.workspaces)
  ) {
    throw new Error(
      "projectrc: workspace is enabled, but no workspaces are defined in your `package.json`.\nPlease add a `workspaces` field to your `package.json`.",
    );
  }

  const workspaces = pkg.workspaces as string[];

  if (!workspaces.length) {
    throw new Error(
      "projectrc: workspace is enabled, but no workspaces are defined in your `package.json`.\nPlease add a `workspaces` field to your `package.json`.",
    );
  }

  const filesResult = await fetch(
    `https://api.github.com/repos/${owner}/${name}/git/trees/main?recursive=1`,
    {
      headers: {
        "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
        "Content-Type": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  ).then((res) => res.json());

  if (!filesResult || typeof filesResult !== "object") {
    throw new Error(
      "projectrc: workspace is enabled, but no files were found.\nPlease add files to your repository.",
    );
  }

  if (!("truncated" in filesResult) || filesResult.truncated) {
    throw new Error(
      "projectrc: workspace is enabled, but the file tree is too large.\nWe are not currently supporting this.",
    );
  }

  if (
    !("tree" in filesResult)
    || !Array.isArray(filesResult.tree)
    || !filesResult.tree.length
  ) {
    throw new Error(
      "projectrc: workspace is enabled, but no files were found.\nPlease add files to your repository.",
    );
  }

  const files = await GITHUB_TREE_SCHEMA.parseAsync(filesResult.tree);

  const filePaths = files.map((file) => file.path);
  const _ignore = ignore().add($raw.workspace?.ignores || []);

  const matchedFilePaths = filePaths.filter(
    (filePath) =>
      workspaces.some((pattern) => minimatch(filePath, pattern))
      && !_ignore.ignores(filePath),
  );

  const results = await Promise.all(
    matchedFilePaths.map(async (filePath) => {
      const url = `https://api.github.com/repos/${owner}/${name}/contents/${filePath}/package.json`;
      const file = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "Content-Type": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }).then((res) => res.json());

      if (
        !file
        || typeof file !== "object"
        || !("content" in file)
        || typeof file.content !== "string"
      ) {
        throw new Error(
          `projectrc: could not find a \`content\` field in \`${url}\`.`,
        );
      }

      const pkg: unknown = JSON.parse(base64ToString(file.content));

      if (
        !pkg
        || typeof pkg !== "object"
        || !("name" in pkg)
        || typeof pkg.name !== "string"
      ) {
        throw new Error(
          `projectrc: could not find a \`name\` field in \`${url}\`.`,
        );
      }

      let _private = false;

      if ("private" in pkg && typeof pkg.private === "boolean") {
        _private = pkg.private;
      }

      return {
        name: pkg.name,
        path: filePath,
        private: _private,
      };
    }),
  );

  const overrides = $raw.workspace?.overrides || [];
  const projects: ProjectRCProject[] = [];
  for (const pkg of results) {
    const override = overrides.find((override) => override.name === pkg.name);

    // if package is inside a folder that you want to include everytime (like `packages/*`),
    // but still want to ignore a specific package.
    if (override && override.ignore) {
      continue;
    }

    const project: ProjectRCProject = {
      description:
        override?.description
        || $raw.description
        || repository.description
        || undefined,
      // title: override?.title || $raw.title || pkg.name,
      name: pkg.name,
    };

    if (override?.website ?? $raw.website) {
      let website;

      if (override?.website && typeof override.website === "string") {
        website = override.website;
      } else if ($raw.website && typeof $raw.website === "string") {
        website = $raw.website;
      } else {
        website = repository.homepageUrl || null;
      }

      project.website = website;
    }

    let readmeSrc = override?.readme || $raw.readme;

    if (typeof readmeSrc === "boolean") {
      // use package readmes if true
      readmeSrc = `/${pkg.path}/README.md`;
    }

    if (readmeSrc) {
      const readme = await getREADME({
        owner,
        repository: name,
        readmePath: readmeSrc,
      });

      if (readme) {
        project.readme = readme;
      }
    }

    if (override?.meta || $raw.meta) {
      const meta = override?.meta || $raw.meta;
      const title = meta?.title || repository.name;
      const description = meta?.description || project.description;
      const keywords = meta?.keywords || [];

      project.meta = {
        title,
        description,
        keywords,
      };
    }

    if (override?.extras || $raw.extras) {
      project.extras ||= {};
      const extras = override?.extras || $raw.extras;

      if (extras?.stars) {
        project.extras.stars = repository.stargazerCount;
      }

      if (extras?.version) {
        const result = await fetch(`https://api.github.com/repos/${owner}/${name}/releases/latest`).then((res) => res.json());

        if (!result || typeof result !== "object" || !("tag_name" in result) || typeof result.tag_name !== "string") {
          throw new Error(
            "projectrc: version is enabled, but no `tag_name` field was found in the GitHub API response.\nPlease try again later.",
          );
        }

        project.extras.version = {
          tag: result.tag_name,
          url: `https://github.com/${owner}/${name}/releases/latest`,
        };
      }

      if (extras?.deprecated) {
        project.extras.deprecated = extras.deprecated;
      }

      if (extras?.npm) {
        let npm = extras.npm;
        if (typeof npm === "boolean") {
          npm = {
            enabled: true,
            downloads: true,
          };
        }

        if (npm && npm.enabled && !pkg.private) {
          const name = npm.name || pkg.name;
          project.extras.npm = {
            name,
            url: `https://www.npmjs.com/package/${name}`,
          };

          if (npm.downloads && project.extras.npm) {
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

    projects.push(project);
  }

  return projects;
}
