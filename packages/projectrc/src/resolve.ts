import { type Input, array, literal, number, object, optional, parseAsync, string, union } from "valibot";
import ignore from "ignore";
import { minimatch } from "minimatch";
import { getRepository, repositoryExists } from "./repository";
import { resolveConfig } from "./config";
import type { SCHEMA } from "./schema";
import { type READMEResult, getREADME } from "./readme";

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
  }
} & {
  projects: (Omit<Input<typeof SCHEMA>, "monorepo" | "readme"> & {
    name: string
    readme?: READMEResult
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
 * @param {string} owner - The owner of the repository.
 * @param {string} name - The name of the repository.
 * @returns {Promise<ProjectRCResponse | undefined>} A Promise that resolves to a ProjectRCResponse object if the configuration exists, otherwise undefined.
 *
 * @example
 * ```ts
 * import { createProjectRCResolver } from "@luxass/projectrc";
 *
 * const projectRCResolver = createProjectRCResolver(process.env.GITHUB_TOKEN);
 *
 * const projectRC = await projectRCResolver.resolve("luxass", "projectrc");
 * // results in:
 * // {
 * //   $projectrc: {
 * //     website: true,
 * //     handles: [
 * //       "/projectrc"
 * //     ],
 * //     $path: "https://api.github.com/repos/luxass/projectrc/contents/.github/.projectrc.json",
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
export async function resolve(
  options: ResolveOptions,
): Promise<ProjectRCResponse | undefined> {
  if (!options.repository || !options.owner || !options.githubToken) {
    return undefined;
  }

  const { owner, repository: name, githubToken } = options;

  if (!(await repositoryExists({
    owner,
    repository: name,
    githubToken,
  }))) {
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
      $path: projectRCFile.path,
    },
    projects: [],
  };

  // if ($raw.monorepo && $raw.monorepo.enabled) {
  //   const pkgResult = await fetch(
  //     `https://api.github.com/repos/${owner}/${name}/contents/package.json`,
  //     {
  //       headers: {
  //         "Authorization": `bearer ${githubToken}`,
  //         "Content-Type": "application/vnd.github+json",
  //         "X-GitHub-Api-Version": "2022-11-28",
  //       },
  //     },
  //   ).then((res) => res.json());

  //   if (
  //     !pkgResult
  //     || typeof pkgResult !== "object"
  //     || !("content" in pkgResult)
  //     || typeof pkgResult.content !== "string"
  //   ) {
  //     throw new Error(
  //       "projectrc: monorepo is enabled, but no `package.json` file was found.\nPlease add a `package.json` file to the root of your repository.",
  //     );
  //   }

  //   const byteArray = new Uint8Array(
  //     atob(pkgResult.content)
  //       .split("")
  //       .map((char) => char.charCodeAt(0)),
  //   );

  //   const pkg: unknown = JSON.parse(
  //     new TextDecoder().decode(byteArray),
  //   );

  //   if (
  //     !pkg
  //     || typeof pkg !== "object"
  //     || !("workspaces" in pkg)
  //     || !Array.isArray(pkg.workspaces)
  //   ) {
  //     throw new Error(
  //       "projectrc: monorepo is enabled, but no workspaces are defined in your `package.json`.\nPlease add a `workspaces` field to your `package.json`.",
  //     );
  //   }

  //   // infer pkg.workspaces as a string array with if checks
  //   const workspaces = pkg.workspaces as string[];

  //   if (!workspaces.length) {
  //     throw new Error(
  //       "projectrc: monorepo is enabled, but no workspaces are defined in your `package.json`.\nPlease add a `workspaces` field to your `package.json`.",
  //     );
  //   }

  //   const filesResult = await fetch(
  //     `https://api.github.com/repos/${owner}/${name}/git/trees/main?recursive=1`,
  //     {
  //       headers: {
  //         "Authorization": `bearer ${githubToken}`,
  //         "Content-Type": "application/vnd.github+json",
  //         "X-GitHub-Api-Version": "2022-11-28",
  //       },
  //     },
  //   ).then((res) => res.json());

  //   if (!filesResult || typeof filesResult !== "object") {
  //     throw new Error(
  //       "projectrc: monorepo is enabled, but no files were found.\nPlease add files to your repository.",
  //     );
  //   }

  //   if (!("truncated" in filesResult) || filesResult.truncated) {
  //     throw new Error(
  //       "projectrc: monorepo is enabled, but the file tree is too large.\nWe are not currently supporting this.",
  //     );
  //   }

  //   if (
  //     !("tree" in filesResult)
  //     || !Array.isArray(filesResult.tree)
  //     || !filesResult.tree.length
  //   ) {
  //     throw new Error(
  //       "projectrc: monorepo is enabled, but no files were found.\nPlease add files to your repository.",
  //     );
  //   }

  //   const files = await parseAsync(FileTreeSchema, filesResult.tree);

  //   const filePaths = files.map((file) => file.path);
  //   const _ignore = ignore().add($raw.monorepo.ignores || []);

  //   const matchedFilePaths = filePaths.filter(
  //     (filePath) =>
  //       workspaces.some((pattern) => minimatch(filePath, pattern))
  //       && !_ignore.ignores(filePath),
  //   );

  //   const results = await Promise.all(
  //     matchedFilePaths.map(async (filePath) => {
  //       const url = `https://api.github.com/repos/${owner}/${name}/contents/${filePath}/package.json`;
  //       const file = await fetch(url, {
  //         headers: {
  //           "Authorization": `bearer ${githubToken}`,
  //           "Content-Type": "application/vnd.github+json",
  //           "X-GitHub-Api-Version": "2022-11-28",
  //         },
  //       }).then((res) => res.json());

  //       if (
  //         !file
  //         || typeof file !== "object"
  //         || !("content" in file)
  //         || typeof file.content !== "string"
  //       ) {
  //         throw new Error(
  //           `projectrc: could not find a \`content\` field in \`${url}\`.`,
  //         );
  //       }

  //       const byteArray = new Uint8Array(
  //         atob(file.content)
  //           .split("")
  //           .map((char) => char.charCodeAt(0)),
  //       );

  //       const pkg: unknown = JSON.parse(
  //         new TextDecoder().decode(byteArray),
  //       );

  //       if (
  //         !pkg
  //         || typeof pkg !== "object"
  //         || !("name" in pkg)
  //         || typeof pkg.name !== "string"
  //       ) {
  //         throw new Error(
  //           `projectrc: could not find a \`name\` field in \`${url}\`.`,
  //         );
  //       }

  //       let _private = false;

  //       if ("private" in pkg && typeof pkg.private === "boolean") {
  //         _private = pkg.private;
  //       }

  //       return {
  //         name: pkg.name,
  //         path: filePath,
  //         private: _private,
  //       };
  //     }),
  //   );

  //   const overrides = $raw.monorepo.overrides || [];
  //   for (const pkg of results) {
  //     const override = overrides.find(
  //       (override) => override.name === pkg.name,
  //     );

  //     // if package is inside a folder that you want to include everytime (like `packages/*`),
  //     // but still want to ignore a specific package.
  //     if (override && override.ignore) {
  //       continue;
  //     }

  //     const project: ProjectRCResponse["projects"][0] = {
  //       description:
  //         override?.description
  //         || $raw.description
  //         || repository.description
  //         || undefined,
  //       name: pkg.name,
  //     };

  //     project.handles = override?.handles || $raw.handles;

  //     let website;

  //     if (override?.website && typeof override.website === "string") {
  //       website = override.website;
  //     } else if ($raw.website && typeof $raw.website === "string") {
  //       website = $raw.website;
  //     } else {
  //       website = repository.homepageUrl || null;
  //     }

  //     project.website = website;

  //     let readmeSrc = override?.readme || $raw.readme;

  //     if (typeof readmeSrc === "boolean") {
  //       // use package readmes if true
  //       readmeSrc = `/${pkg.path}/README.md`;
  //     }

  //     if (readmeSrc) {
  //       const readme = await getREADME({
  //         owner,
  //         repository: name,
  //         readmePath: readmeSrc,
  //         githubToken,
  //       });
  //       if (readme) {
  //         project.readme = readme;
  //       }
  //     }

  //     const npmSrc = override?.npm || $raw.npm;

  //     if (npmSrc && !pkg.private) {
  //       project.npm
  //         = typeof npmSrc === "string"
  //           ? npmSrc
  //           : `https://www.npmjs.com/package/${pkg.name}`;
  //     }

  //     project.deprecated = override?.deprecated || $raw.deprecated;

  //     result.projects.push(project);
  //   }
  // } else {
  //   const project: ProjectRCResponse["projects"][0] = {
  //     description: $raw.description || repository.description || undefined,
  //     name: repository.name,
  //   };

  //   if ($raw.handles) {
  //     project.handles = $raw.handles;
  //   }

  //   if ($raw.website) {
  //     project.website
  //       = typeof $raw.website === "string"
  //         ? $raw.website
  //         : repository.homepageUrl || null;
  //   }

  //   if ($raw.readme) {
  //     const readme = await getREADME({
  //       owner,
  //       repository: name,
  //       readmePath: $raw.readme,
  //       githubToken,
  //     });

  //     if (readme) {
  //       project.readme = readme;
  //     }
  //   }

  //   if ($raw.npm) {
  //     const url = `https://api.github.com/repos/${owner}/${name}/contents/package.json`;
  //     const file = await fetch(url, {
  //       headers: {
  //         "Authorization": `bearer ${githubToken}`,
  //         "Content-Type": "application/vnd.github+json",
  //         "X-GitHub-Api-Version": "2022-11-28",
  //       },
  //     }).then((res) => res.json());

  //     if (
  //       !file
  //       || typeof file !== "object"
  //       || !("content" in file)
  //       || typeof file.content !== "string"
  //     ) {
  //       throw new Error(
  //         `projectrc: could not find a \`content\` field in \`${url}\`.`,
  //       );
  //     }

  //     const byteArray = new Uint8Array(
  //       atob(file.content)
  //         .split("")
  //         .map((char) => char.charCodeAt(0)),
  //     );

  //     const pkg: unknown = JSON.parse(
  //       new TextDecoder().decode(byteArray),
  //     );

  //     if (
  //       !pkg
  //       || typeof pkg !== "object"
  //       || !("name" in pkg)
  //       || typeof pkg.name !== "string"
  //     ) {
  //       throw new Error(
  //         `projectrc: could not find a \`name\` field in \`${url}\`.`,
  //       );
  //     }
  //     project.npm
  //       = typeof $raw.npm === "string"
  //         ? $raw.npm
  //         : `https://www.npmjs.com/package/${pkg.name}`;
  //   }

  //   if ($raw.ignore) {
  //     throw new Error("projectrc: how did you get here?");
  //   }

  //   if ($raw.deprecated) {
  //     project.deprecated = $raw.deprecated;
  //   }

  //   result.projects.push(project);
  // }

  return result;
}
