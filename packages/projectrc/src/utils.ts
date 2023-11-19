import { Buffer } from "node:buffer";
import { parseAsync } from "valibot";
import { CONFIG_FILE_NAMES } from "./constants";
import type { ProjectRCFile } from "./types";
import { SCHEMA } from "./schema";

export interface ResolveConfigOptions {
  owner: string
  repository: string
  githubToken?: string
}

/**
 * Find the projectrc file in the repository.
 * @param {ResolveConfigOptions} options The options to use.
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
 * //   path: "https://api.github.com/repos/luxass/projectrc/contents/.github/projectrc.json",
 * //   content: {
 * //     website: true,
 * //     handles: [
 * //       "/projectrc"
 * //     ],
 * //   }
 * // }
 * ```
 */
export async function resolveConfig(options: ResolveConfigOptions): Promise<ProjectRCFile | undefined> {
  if (!options.owner || !options.repository) {
    return undefined;
  }

  const { owner, repository, githubToken } = options;

  for (const configFileName of CONFIG_FILE_NAMES) {
    try {
      const url = new URL(
        `https://api.github.com/repos/${owner}/${repository}/contents/.github/${configFileName}`,
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
        content: parsed,
        path: url.toString(),
      };
    } catch (err) {
      continue;
    }
  }
}
