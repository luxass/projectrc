import type { ZodIssue, z } from "zod";
import { parse as parseToml } from "smol-toml";
import {
  zodErrorMap,
} from "zod-error-utils";
import { base64ToString } from "./utils";
import { MOSAIC_SCHEMA } from "./schema";

export interface ResolvedConfigResult {
  type: "resolved";
  content: z.infer<typeof MOSAIC_SCHEMA>;
  external: boolean;
  path: string;
}

export interface ResolvedConfigError {
  type: "error";
  issues: ZodIssue[];
}

export interface ResolveConfigOptions {
  owner: string;
  repository: string;
  githubToken?: string;
  external?: ExternalOptions;
}

export interface ExternalOptions {
  owner: string;
  repo: `${string}/${string}`;
}

/**
 * Find the `mosaic.toml` file in the repository.
 * @param {ResolveConfigOptions} options The options to use.
 * @returns {Promise<ProjectRCFile | undefined>} The `mosaic.toml` file if any file was found otherwise `undefined`.
 *
 * @example
 * ```ts
 * import { resolveConfig } from "@luxass/mosaic";
 *
 * const projectRCFile = await resolveConfig({
 *  owner: "luxass",
 *  repository: "mosaic",
 * });
 * // results in:
 * // {
 * //   path: "https://api.github.com/repos/luxass/mosaic/contents/.github/mosaic.toml",
 * //   content: {
 * //     website: true,
 * //     handles: [
 * //       "/projectrc"
 * //     ],
 * //   }
 * // }
 * ```
 */
export async function resolveConfig(options: ResolveConfigOptions): Promise<ResolvedConfigError | ResolvedConfigResult | undefined> {
  let {
    owner,
    repository,
    githubToken,
    external: externalOptions,
  } = options;
  if (!owner || !repository) {
    return undefined;
  }

  try {
    let external = false;
    let externalPath = `https://github.com/${owner}/${repository}/blob/main/.github/mosaic.toml`;

    let url = new URL(`https://api.github.com/repos/${owner}/${repository}/contents/.github/mosaic.toml`);

    if ((externalOptions != null && typeof externalOptions === "object") && owner !== externalOptions.owner) {
      external = true;
      externalPath = `https://github.com/${externalOptions.repo}/blob/main/.github/mosaic/${owner.toLowerCase()}/${repository.toLowerCase()}.toml`;

      // when the owner is not luxass, resolve the repository externally
      // every external repository that should be resolved, requires
      // a `mosaic.toml` file in luxass/luxass repository
      // the path for these files should be .github/mosaic/<external-owner>/<external-repository>.toml
      // for example: .github/mosaic/vercel/next.js.toml
      if (repository.endsWith(".toml")) {
        repository = repository.slice(0, -5);
      }

      url = new URL(
        `https://api.github.com/repos/${externalOptions.repo}/contents/.github/mosaic/${owner.toLowerCase()}/${repository.toLowerCase()}.toml`,
      );
    }

    const result = await fetch(url, {
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

    if (!result || typeof result !== "object" || !("content" in result) || typeof result.content !== "string") {
      return;
    }

    const content = parseToml(base64ToString(result.content));

    const parsed = await MOSAIC_SCHEMA.safeParseAsync(content, {
      errorMap: zodErrorMap,
    });

    if (!parsed.success) {
      console.error(parsed.error);
      return {
        type: "error",
        issues: parsed.error.errors,
      };
    }

    const config = parsed.data;
    if (config.workspace?.enabled && config.workspace.overrides != null) {
      for (const [key] of Object.entries(config.workspace.overrides)) {
        const projectOverride = config.workspace.overrides[key];
        if (projectOverride == null) {
          throw new Error("project not found, how did this happen?");
        }

        projectOverride.project.name = key;
      }
    }

    return {
      type: "resolved",
      content: config,
      external,
      path: externalPath,
    };
  } catch (err) {
    console.error(err);
  }
}
