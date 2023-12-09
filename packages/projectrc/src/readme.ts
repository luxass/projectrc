import { base64ToString } from "./utils";

export interface READMEOptions {
  owner: string
  repository: string
  readmePath?: boolean | string
  githubToken?: string
}

export interface READMEResult {
  content: string
  path: string
}

/**
 * Fetches the readme content of a GitHub repository.
 * @param {READMEOptions} options - The options to use.
 * @returns {Promise<READMEResult | undefined>} A Promise that resolves to a ReadmeResult object containing the path and content of the readme file, or undefined if the readme could not be fetched.
 *
 * @example
 * ```ts
 * import { getREADME } from "@luxass/projectrc";
 *
 * const readme = await getREADME({
 *  owner: "luxass",
 *  repository: "projectrc",
 *  readmePath: "README.md",
 * });
 * // results in:
 * // {
 * //   path: "https://api.github.com/repos/luxass/projectrc/contents/README.md",
 * //   content: "# ProjectRC\n\nProjectRC is a project configuration file for luxass.dev.\n",
 * // }
 * ```
 */
export async function getREADME(
  options: READMEOptions,
): Promise<READMEResult | undefined> {
  if (!options.owner || !options.repository) {
    return undefined;
  }

  const { owner, repository, githubToken } = options;

  let { readmePath } = options;

  const readmeUrl = new URL(
    `https://api.github.com/repos/${owner}/${repository}`,
  );

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
        ...(githubToken && { Authorization: `bearer ${githubToken}` }),
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
      content: base64ToString(result.content),
      path: readmeUrl.toString(),
    };
  } catch (err) {
    return undefined;
  }
}
