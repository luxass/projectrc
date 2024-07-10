import type { ZodIssue, z } from "zod";
import { GITHUB_TOKEN } from "astro:env/server";
import { parse as parseToml } from "smol-toml";
import {
  zodErrorMap,
} from "zod-error-utils";
import { base64ToString } from "./utils";
import { MOSAIC_SCHEMA } from "./json-schema";

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
  name: string;
}

export async function resolveConfig(owner: string, repository: string): Promise<ResolvedConfigError | ResolvedConfigResult | undefined> {
  if (!owner || !repository) {
    return undefined;
  }

  try {
    let external = false;

    let url = new URL(`https://api.github.com/repos/${owner}/${repository}/contents/.github/mosaic.toml`);

    if (owner !== "luxass") {
      external = true;

      // when the owner is not luxass, resolve the repository externally
      // every external repository that should be resolved, requires
      // a `mosaic.toml` file in luxass/luxass repository
      // the path for these files should be .github/mosaic/<external-owner>/<external-repository>.toml
      // for example: .github/mosaic/vercel/next.js.toml
      if (repository.endsWith(".toml")) {
        repository = repository.slice(0, -5);
      }

      url = new URL(
        `https://api.github.com/repos/luxass/luxass/contents/.github/mosaic/${owner.toLowerCase()}/${repository.toLowerCase()}.toml`,
      );
    }

    const result = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
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
      path: `https://github.com/${owner}/${repository}/blob/main/.github/mosaic.toml`,
    };
  } catch (err) {
    console.error(err);
  }
}
