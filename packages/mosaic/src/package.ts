import { z } from "zod";
import { base64ToString } from "./utils";

export const PACKAGE_JSON_SCHEMA = z.object({
  name: z
    .string()
    .regex(/^(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~]|[a-z0-9-~])[a-z0-9-._~]*$/)
    .min(1)
    .max(214)
    .describe("The name of the package.")
    .optional(),
  version: z
    .string()
    .describe("Version must be parseable by node-semver, which is bundled with npm as a dependency.")
    .optional(),
  private: z.boolean().describe("If set to true, then npm will refuse to publish it.").optional(),
  workspaces: z
    .array(z.string())
    .describe(
      "Allows packages within a directory to depend on one another using direct linking of local files. Additionally, dependencies within a workspace are hoisted to the workspace root when possible to reduce duplication. Note: It's also a good idea to set \"private\" to true when using this feature.",
    )
    .optional(),
});

export interface GetPackageOptions {
  owner: string;
  repository: string;
  path?: string;
  githubToken?: string;
}

/**
 * Retrieves the package.json file from a GitHub repository.
 *
 * @param {GetPackageOptions} options - The options for the function.
 * @returns {Promise<z.infer<typeof PACKAGE_JSON_SCHEMA>>} A promise that resolves to the parsed package.json object.
 * @throws {Error} An error if the GitHub API response for package.json is invalid.
 *
 * @example
 * ```ts
 * const pkg = await getPackage({
 *  owner: "luxass",
 *  repository: "mosaic",
 * });
 * // results in the package.json object.
 */
export async function getPackage(options: GetPackageOptions): Promise<z.infer<typeof PACKAGE_JSON_SCHEMA>> {
  let { owner, repository, path = "package.json", githubToken } = options;
  if (!path.endsWith("/package.json") && path !== "package.json") path += "/package.json";

  const pkgResult = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents/${path}`, {
    headers: {
      ...(githubToken != null
        ? {
            Authorization: `Bearer ${githubToken}`,
          }
        : {}),
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }).then((res) => res.json());

  if (
    !pkgResult
    || typeof pkgResult !== "object"
    || !("content" in pkgResult)
    || typeof pkgResult.content !== "string"
  ) {
    throw new Error("invalid github api response for package.json");
  }

  return await PACKAGE_JSON_SCHEMA.parseAsync(JSON.parse(base64ToString(pkgResult.content)));
}
