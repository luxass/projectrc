import type { z } from "zod";
import { base64ToString } from "./utils";
import { PROJECTRC_SCHEMA } from "./schema";
import { env } from "~/env.mjs";

export interface ResolveConfigResult {
  content: z.infer<typeof PROJECTRC_SCHEMA>
  path: string
}

export interface ResolveConfigOptions {
  owner: string
  name: string
}

export async function resolveConfig(
  owner: string,
  repository: string,
): Promise<ResolveConfigResult | undefined> {
  if (!owner || !repository) {
    return undefined;
  }

  try {
    const url = new URL(
        `https://api.github.com/repos/${owner}/${repository}/contents/.github/projectrc.json`,
    );

    const result = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
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
      return;
    }

    const content = JSON.parse(base64ToString(result.content));

    const parsed = await PROJECTRC_SCHEMA.parseAsync(content);

    return {
      content: parsed,
      path: url.toString(),
    };
  } catch (err) {
    console.error(err);
  }
}
