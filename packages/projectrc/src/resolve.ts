import {
  type Input,
  array,
  literal,
  number,
  object,
  optional,
  parseAsync,
  string,
  union,
} from "valibot";
import ignore from "ignore";
import { minimatch } from "minimatch";
import { getRepository, repositoryExists } from "./repository";
import { resolveConfig } from "./config";
import type { SCHEMA } from "./schema";
import { type READMEResult, getREADME } from "./readme";
import { base64ToString } from "./utils";

type SafeOmit<T, K extends keyof T> = Omit<T, K>;

const FileTreeSchema = array(
  object({
    mode: string(),
    path: string(),
    sha: string(),
    size: optional(number()),
    type: union([literal("tree"), literal("blob")]),
    url: string(),
  }),
);

export type ProjectRCResponse = {
  $projectrc: Input<typeof SCHEMA> & {
    $path: string
    $gitPath: string
  }
} & {
  projects: (SafeOmit<Input<typeof SCHEMA>, "workspace" | "readme" | "stars" | "npm" | "version"> & {
    name: string
    readme?: READMEResult
    stars?: number
    npm?: {
      name?: string
      url?: string
      downloads?: number
    }
    version?: {
      name: string
      url: string
    }
  })[]
};

export interface ResolveOptions {
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

/**
 * Resolves a projectrc configuration for the given owner and name.
 * @param {ResolveOptions} options The options to use
 * @returns {Promise<ProjectRCResponse | undefined>} A Promise that resolves to a ProjectRCResponse object if the configuration exists, otherwise undefined.
 *
 * @example
 * ```ts
 * import { resolveProjectRC } from "@luxass/projectrc";
 *
 * const projectRC = await resolveProjectRC({
 *  owner: "luxass",
 *  repository: "projectrc",
 *  githubToken: process.env.GITHUB_TOKEN,
 * });
 * // results in:
 * // {
 * //   $projectrc: {
 * //     website: true,
 * //     handles: [
 * //       "/projectrc"
 * //     ],
 * //     $gitPath: "https://api.github.com/repos/luxass/projectrc/contents/.github/.projectrc.json",
 * //     $path: "https://projectrc.luxass.dev/resolve/projectrc/rc",
 * //   },
 * //   projects: [
 * //     {
 * //       name: "projectrc",
 * //       handles: [
 * //         "/projectrc"
 * //       ],
 * //       website: "https://luxass.dev/projectrc",
 * //     }
 * //   ]
 * // }
 * ```
 */
export async function resolveProjectRC(
  options: ResolveOptions,
): Promise<ProjectRCResponse | undefined> {
  if (!options.repository || !options.owner || !options.githubToken) {
    return undefined;
  }

  const { owner, repository: name, githubToken } = options;

  if (
    !(await repositoryExists({
      owner,
      repository: name,
      githubToken,
    }))
  ) {
    return undefined;
  }

  const projectRCFile = await resolveConfig({
    owner,
    repository: name,
    githubToken,
  });

  if (!projectRCFile) {
    return undefined;
  }

  const repository = await getRepository({
    owner,
    repository: name,
    githubToken,
  });

  if (!repository) {
    return undefined;
  }

  const { content: $raw } = projectRCFile;

  if ($raw.ignore) {
    return undefined;
  }

  const result: ProjectRCResponse = {
    $projectrc: {
      ...$raw,
      $gitPath: projectRCFile.path,
      $path: `https://projectrc.luxass.dev/resolve/${name}/rc`,
    },
    projects: [],
  };

  if ($raw.workspace && $raw.workspace.enabled) {
    const pkgResult = await fetch(
      `https://api.github.com/repos/${owner}/${name}/contents/package.json`,
      {
        headers: {
          "Authorization": `bearer ${githubToken}`,
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
          "Authorization": `bearer ${githubToken}`,
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

    const files = await parseAsync(FileTreeSchema, filesResult.tree);

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
            "Authorization": `bearer ${githubToken}`,
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
    for (const pkg of results) {
      const override = overrides.find((override) => override.name === pkg.name);

      // if package is inside a folder that you want to include everytime (like `packages/*`),
      // but still want to ignore a specific package.
      if (override && override.ignore) {
        continue;
      }

      const project: ProjectRCResponse["projects"][0] = {
        description:
          override?.description
          || $raw.description
          || repository.description
          || undefined,
        title: override?.title || $raw.title || pkg.name,
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

      if (override?.stars ?? $raw.stars) {
        project.stars = repository.stargazerCount;
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
          githubToken,
        });
        if (readme) {
          project.readme = readme;
        }
      }

      let npm = override?.npm || $raw.npm;
      if (typeof npm === "boolean") {
        npm = {
          enabled: true,
          downloads: true,
        };
      }

      if (npm && npm.enabled && !pkg.private) {
        const name = npm.name || pkg.name;
        project.npm = {
          name,
          url: `https://www.npmjs.com/package/${name}`,
        };

        if (npm.downloads && project.npm.name) {
          const result = await fetch(`https://api.npmjs.org/downloads/point/last-month/${project.npm.name}`).then((res) => res.json());

          if (!result || typeof result !== "object" || !("downloads" in result) || typeof result.downloads !== "number") {
            throw new Error(
              "projectrc: npm.downloads is enabled, but no `downloads` field was found in the npm API response.\nPlease try again later.",
            );
          }

          project.npm.downloads = result.downloads;
        }
      }

      if ($raw.deprecated) {
        project.deprecated = override?.deprecated || $raw.deprecated;
      }

      result.projects.push(project);
    }
  } else {
    const project: ProjectRCResponse["projects"][0] = {
      description: $raw.description || repository.description || undefined,
      title: $raw.title || repository.name,
      name: repository.name,
    };

    if ($raw.website) {
      project.website
        = typeof $raw.website === "string"
          ? $raw.website
          : repository.homepageUrl || null;
    }

    if ($raw.stars) {
      project.stars = repository.stargazerCount;
    }

    if ($raw.readme) {
      const readme = await getREADME({
        owner,
        repository: name,
        readmePath: $raw.readme,
        githubToken,
      });

      if (readme) {
        project.readme = readme;
      }
    }

    let npm = $raw.npm;
    if (typeof npm === "boolean" && npm) {
      npm = {
        enabled: true,
        downloads: true,
      };
    }

    if (npm && npm?.enabled) {
      if (npm.name) {
        project.npm = {
          name: npm.name,
          url: `https://www.npmjs.com/package/${npm.name}`,
        };
      } else {
        const pkgResult = await fetch(
          `https://api.github.com/repos/${owner}/${name}/contents/package.json`,
          {
            headers: {
              "Authorization": `bearer ${githubToken}`,
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

        project.npm = {
          name: pkg.name,
          url: `https://www.npmjs.com/package/${pkg.name}`,
        };

        if (npm.downloads && project.npm.name) {
          const result = await fetch(`https://api.npmjs.org/downloads/point/last-month/${project.npm.name}`).then((res) => res.json());

          if (!result || typeof result !== "object" || !("downloads" in result) || typeof result.downloads !== "number") {
            throw new Error(
              "projectrc: npm.downloads is enabled, but no `downloads` field was found in the npm API response.\nPlease try again later.",
            );
          }

          project.npm.downloads = result.downloads;
        }
      }
    }

    if ($raw.version) {
      const result = await fetch(`https://api.github.com/repos/${owner}/${name}/releases/latest`).then((res) => res.json());

      if (!result || typeof result !== "object" || !("tag_name" in result) || typeof result.tag_name !== "string") {
        throw new Error(
          "projectrc: version is enabled, but no `tag_name` field was found in the GitHub API response.\nPlease try again later.",
        );
      }

      project.version = {
        name: result.tag_name,
        url: `https://github.com/${owner}/${name}/releases/latest`,
      };
    }

    if ($raw.ignore) {
      throw new Error("projectrc: how did you get here?");
    }

    if ($raw.deprecated) {
      project.deprecated = $raw.deprecated;
    }

    result.projects.push(project);
  }

  return result;
}
