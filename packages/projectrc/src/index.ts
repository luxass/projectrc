import { Buffer } from "node:buffer";
import { type Input, parseAsync } from "valibot";
import { type RepositoryNode, gql } from "github-schema";
import { graphql } from "@octokit/graphql";
import { SCHEMA } from "./schema";

export type ProjectRC = Input<typeof SCHEMA>;

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

export const CONFIG_FILE_NAMES: string[] = [
  ".projectrc.json",
  ".projectrc",
  ".projectrc.json5",
];

export interface ProjectRCFile {
  path: string
  content: Input<typeof SCHEMA>
}

/**
 * Returns an object with methods to interact with a GitHub repository's ProjectRC file.
 * @param {string} githubToken - The GitHub token to use for authentication.
 * @returns An object with methods to interact with a GitHub repository's ProjectRC file.
 *
 * @example
 * ```ts
 * import { createProjectRCResolver } from "@luxass/projectrc";
 *
 * const projectRCResolver = createProjectRCResolver(process.env.GITHUB_TOKEN);
 *
 * // check if a repository exists
 * const exists = await projectRCResolver.exists("luxass", "projectrc");
 *
 * // get the repository's ProjectRC file
 * const projectRCFile = await projectRCResolver.config("luxass", "projectrc");
 *
 * // get the repository's readme
 * const readme = await projectRCResolver.readme("luxass", "projectrc");
 * ```
 */
export function createProjectRCResolver(githubToken: string) {
  return {
    /**
     * Find the projectrc file in the repository.
     * @param {string?} owner - The owner of the repository.
     * @param {string?} name - The name of the repository.
     * @returns {Promise<ProjectRCFile | undefined>} The projectrc file if any file was found otherwise `undefined`.
     *
     * @example
     * ```ts
     * import { createProjectRCResolver } from "@luxass/projectrc";
     *
     * const projectRCResolver = createProjectRCResolver(process.env.GITHUB_TOKEN);
     *
     * const projectRCFile = await projectRCResolver.config("luxass", "projectrc");
     * // results in:
     * // {
     * //   path: "https://api.github.com/repos/luxass/projectrc/contents/.github/.projectrc.json",
     * //   content: {
     * //     website: true,
     * //     handles: [
     * //       "/projectrc"
     * //     ],
     * //   }
     * // }
     * ```
     */
    async config(owner?: string, name?: string): Promise<ProjectRCFile | undefined> {
      if (!owner || !name) return undefined;

      for (const configFileName of CONFIG_FILE_NAMES) {
        try {
          const url = new URL(
            `https://api.github.com/repos/${owner}/${name}/contents/.github/${configFileName}`,
          );
          const result = await fetch(url.toString(), {
            headers: {
              "Authorization": `Bearer ${githubToken}`,
              "Content-Type": "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }).then((res) => res.json());

          if (
            !result
            || typeof result !== "object"
            || !("content" in result)
            || typeof result.content !== "string"
          ) {
            continue;
          }

          const content = JSON.parse(
            Buffer.from(result.content, "base64").toString("utf-8"),
          );

          const parsed = await parseAsync(SCHEMA, content);

          return {
            path: url.toString(),
            content: parsed,
          };
        } catch (err) {
          continue;
        }
      }
    },
    /**
     * Checks whether the given repository exists
     * @param {string} owner - The owner of the repository
     * @param {string} name - The name of the repository
     * @returns {Promise<boolean>} Whether the repository exists
     *
     * NOTE: This doesn't check whether the repository is public or private
     *
     * @example
     * ```ts
     * import { createProjectRCResolver } from "@luxass/projectrc";
     *
     * const projectRCResolver = createProjectRCResolver(process.env.GITHUB_TOKEN);
     *
     * await projectRCResolver.exists("luxass", "projectrc");
     * // true or false based on whether the repository exists
     * ```
     */
    async exists(owner?: string, name?: string): Promise<boolean> {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
          headers: {
            "Authorization": `bearer ${githubToken}`,
            "Content-Type": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        if (!res.ok) {
          return false;
        }

        return true;
      } catch (err) {
        return false;
      }
    },
    /**
     * Get a repository from GitHub
     * @param {string} owner - The owner of the repository
     * @param {string} name - The name of the repository
     * @returns {Promise<RepositoryNode["repository"]>} The `RepositoryNode` of the repository
     *
     * NOTE: This is not the full response from GitHub, as it only contains the fields we need.
     * To see what we request, you can see the `REPOSITORY_QUERY` export.
     *
     * @example
     * ```ts
     * import { createProjectRCResolver } from "@luxass/projectrc";
     *
     * const projectRCResolver = createProjectRCResolver(process.env.GITHUB_TOKEN);
     *
     * const repository = await projectRCResolver.repository("luxass", "projectrc");
     * // results in:
     * // {
     * //   name: "projectrc",
     * //   GITHUB RESPONSE...
     * // }
     * ```
     */
    async repository(owner?: string, name?: string): Promise<RepositoryNode["repository"] | undefined> {
      try {
        const { repository } = await graphql<RepositoryNode>(REPOSITORY_QUERY, {
          owner,
          name,
          headers: {
            "Authorization": `bearer ${githubToken}`,
            "Content-Type": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        return repository;
      } catch (err) {
        return undefined;
      }
    },
    /**
     * Fetches the readme content of a GitHub repository.
     * @param owner - The owner of the repository.
     * @param name - The name of the repository.
     * @param readmePath - The path to the readme file. If not provided, the default readme file will be fetched.
     * @returns A Promise that resolves to a ReadmeResult object containing the path and content of the readme file, or undefined if the readme could not be fetched.
     *
     * @example
     * ```ts
     * import { createProjectRCResolver } from "@luxass/projectrc";
     *
     * const projectRCResolver = createProjectRCResolver(process.env.GITHUB_TOKEN);
     *
     * const readme = await projectRCResolver.readme("luxass", "projectrc");
     * // results in:
     * // {
     * //   path: "https://api.github.com/repos/luxass/projectrc/contents/README.md",
     * //   content: "# ProjectRC\n\nProjectRC is a project configuration file for luxass.dev.\n",
     * // }
     * ```
     */
    async readme(owner?: string, name?: string, readmePath?: string | boolean): Promise<ReadmeResult | undefined> {
      const readmeUrl = new URL(`https://api.github.com/repos/${owner}/${name}`);

      if (typeof readmePath === "string") {
        if (readmePath.startsWith("/")) {
          readmePath = readmePath.slice(1);
        }

        if (!readmePath.endsWith("README.md")) {
          readmePath += "/README.md";
        }

        readmeUrl.pathname += `/contents/${readmePath}`;
      } else {
        readmeUrl.pathname += "/readme";
      }

      try {
        const result = await fetch(readmeUrl.toString(), {
          headers: {
            "Authorization": `bearer ${githubToken}`,
            "Content-Type": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }).then((res) => res.json());

        if (
          !result
          || typeof result !== "object"
          || !("content" in result)
          || typeof result.content !== "string"
        ) {
          return undefined;
        }

        return {
          path: readmeUrl.toString(),
          content: Buffer.from(result.content, "base64").toString("utf-8"),
        };
      } catch (err) {
        return undefined;
      }
    },
  };
}

export interface ReadmeResult {
  path: string
  content: string
}

export type ProjectRCResponse = {
  $projectrc: Input<typeof SCHEMA> & {
    $path: string
  }
} & Omit<Input<typeof SCHEMA>, "readme"> & {
  readme?: ReadmeResult
};

// export async function getProjectRC(
//   owner: string,
//   name: string,
// ): Promise<ProjectRCResponse | undefined> {
//   if (!owner || !name) return undefined;
//   if (!(await exists(owner, name))) return undefined;

//   const projectRCFile = await getProjectRCFile(owner, name);
//   if (!projectRCFile) return undefined;

//   const repository = await getRepository(owner, name);
//   if (!repository) return undefined;

//   const { content: $raw } = projectRCFile;

//   if ($raw.ignore) {
//     return undefined;
//   }

//   const result: ProjectRCResponse = {
//     $projectrc: {
//       ...$raw,
//       $path: projectRCFile.path,
//     },
//   };

//   if ($raw.monorepo && $raw.monorepo.enabled) {
//     throw new Error("projectrc: support `monorepo` is not implemented yet.");
//   }

//   if ($raw.handles) {
//     result.handles = $raw.handles;
//   }

//   if ($raw.website) {
//     result.website
//       = typeof $raw.website === "string"
//         ? $raw.website
//         : repository.homepageUrl || null;
//   }

//   if ($raw.readme) {
//     const readme = await getReadme(owner, name, $raw.readme);
//     if (readme) {
//       result.readme = readme;
//     }
//   }

//   if ($raw.npm) {
//     result.npm
//       = typeof $raw.npm === "string"
//         ? $raw.npm
//         : `https://www.npmjs.com/package/${name}`;
//   }

//   return result;
// }
