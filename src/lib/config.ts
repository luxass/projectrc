import type { z } from "zod";
import { base64ToString } from "./utils";
import { PROJECTRC_SCHEMA } from "./schema";

export interface ResolveConfigResult {
  content: z.infer<typeof PROJECTRC_SCHEMA>
  external: boolean
  path: string
}

export interface ResolveConfigOptions {
  owner: string
  name: string
}

export async function resolveConfig(owner: string, repository: string): Promise<ResolveConfigResult | undefined> {
  if (!owner || !repository) {
    return undefined;
  }

  try {
    let external = false;

    let url = new URL(`https://api.github.com/repos/${owner}/${repository}/contents/.github/projectrc.json`);

    if (owner !== "luxass") {
      external = true;

      // when the owner is not luxass, resolve the repository externally
      // every external repository that should be resolved, requires
      // a projectrc file in luxass/luxass repository
      // the path for these files should be .github/projectrc/<external-owner>/<external-repository>.json
      // for example: .github/projectrc/vercel/next.js.json
      if (repository.endsWith(".json")) {
        repository = repository.slice(0, -5);
      }

      url = new URL(
        `https://api.github.com/repos/luxass/luxass/contents/.github/projectrc/${owner}/${repository}.json`,
      );
    }

    const result = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${import.meta.env.GITHUB_TOKEN}`,
        "Content-Type": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }).then((res) => res.json());

    if (!result || typeof result !== "object" || !("content" in result) || typeof result.content !== "string") {
      return;
    }

    const content = JSON.parse(base64ToString(result.content));

    const parsed = await PROJECTRC_SCHEMA.parseAsync(content);

    return {
      content: parsed,
      external,
      path: `https://github.com/${owner}/${repository}/blob/main/.github/projectrc.json`,
    };
  } catch (err) {
    console.error(err);
  }
}
