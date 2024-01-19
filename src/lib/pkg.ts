import type { z } from "zod"
import { PACKAGE_JSON_SCHEMA } from "./schemas/package-json"
import { base64ToString } from "./utils"

/**
 * Retrieves the package.json file from a GitHub repository.
 *
 * @param {string} owner - The owner of the repository.
 * @param {string} repository - The name of the repository.
 * @param {string} [path] - The path to the package.json file.
 * @returns {Promise<z.infer<typeof PACKAGE_JSON_SCHEMA>>} A promise that resolves to the parsed package.json object.
 * @throws {Error} An error if the GitHub API response for package.json is invalid.
 */
export async function getPackage(
  owner: string,
  repository: string,
  path: string = "package.json",
): Promise<z.infer<typeof PACKAGE_JSON_SCHEMA>> {
  if (!path.endsWith("/package.json") && path !== "package.json") path += "/package.json"

  const pkgResult = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents/${path}`, {
    headers: {
      "Authorization": `Bearer ${import.meta.env.GITHUB_TOKEN}`,
      "Content-Type": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }).then((res) => res.json())

  if (
    !pkgResult
    || typeof pkgResult !== "object"
    || !("content" in pkgResult)
    || typeof pkgResult.content !== "string"
  ) {
    throw new Error("invalid github api response for package.json")
  }

  return await PACKAGE_JSON_SCHEMA.parseAsync(JSON.parse(base64ToString(pkgResult.content)))
}
