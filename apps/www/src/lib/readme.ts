import { GITHUB_TOKEN } from "astro:env/server";
import { base64ToString } from "./utils";

export interface READMEOptions {
  owner: string;
  repository: string;
  readmePath?: boolean | string;
}

export interface READMEResult {
  content: string;
  path: string;
}

export async function getREADME(options: READMEOptions): Promise<READMEResult | undefined> {
  if (!options.owner || !options.repository) {
    return undefined;
  }

  const { owner, repository } = options;

  let { readmePath } = options;

  const readmeUrl = new URL(`https://api.github.com/repos/${owner}/${repository}`);

  if (typeof readmePath === "string" && readmePath !== "") {
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
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }).then((res) => res.json());

    if (!result || typeof result !== "object" || !("content" in result) || typeof result.content !== "string") {
      return undefined;
    }

    return {
      content: base64ToString(result.content),
      path: readmeUrl.toString(),
    };
  } catch {
    return undefined;
  }
}
