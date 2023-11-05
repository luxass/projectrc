import process from "node:process";
import { Buffer } from "node:buffer";
import { type Input, parseAsync } from "valibot";
import { XGitHubApiVersionHeaderValue } from "./constants";
import { SCHEMA } from "./schema";

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
 * Find the projectrc file in the repository.
 * @param {string?} owner - The owner of the repository.
 * @param {string?} name - The name of the repository.
 * @returns {Promise<ProjectRCFile | undefined>} The projectrc file if any file was found otherwise `undefined`.
 */
export async function getProjectRCFile(
  owner?: string,
  name?: string,
): Promise<ProjectRCFile | undefined> {
  if (!owner || !name) return undefined;

  for (const configFileName of CONFIG_FILE_NAMES) {
    try {
      const url = new URL(
        `https://api.github.com/repos/${owner}/${name}/contents/.github/${configFileName}`,
      );
      const result = await fetch(url.toString(), {
        headers: {
          "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/vnd.github+json",
          "X-GitHub-Api-Version": XGitHubApiVersionHeaderValue,
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
}
