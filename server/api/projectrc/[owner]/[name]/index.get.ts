import process from "node:process";
import { Buffer } from "node:buffer";
import type { Static } from "@sinclair/typebox";
import type { ProjectRCResponse } from "~/types";

export default defineEventHandler(async (event) => {
  try {
    if (!event.context.params) {
      return notFound(event);
    }
    const { owner, name } = event.context.params;
    if (!ALLOWED_OWNERS.includes(owner) || BLOCKED_REPOSITORIES.includes(name)) {
      return notFound(event);
    }

    if (!(await isExistingRepository(owner, name))) {
      return notFound(event);
    }

    const repository = await getRepository(owner, name);

    const { object } = repository;

    const projectrcFile = object?.entries.find((entry) =>
      PROJECTRC_NAMES.includes(entry.name),
    );

    if (!projectrcFile) {
      return notFound(event);
    }

    const defaultBranch = repository.defaultBranchRef?.name || "main";

    const projectrcContent = await $fetch(
      `${repository.url}/blob/${defaultBranch}/${projectrcFile.path}?raw=true`,
    );

    if (!projectrcContent || typeof projectrcContent !== "string") {
      return notFound(event);
    }

    if (!PROJECTRC_VALIDATE(JSON.parse(projectrcContent))) {
      return notFound(event);
    }

    const projectRC = JSON.parse(projectrcContent) as Static<
      typeof PROJECTRC_TYPEBOX_SCHEMA
    >;

    const response: ProjectRCResponse = {
      raw: projectRC,
    };
    const acceptHeader = getRequestHeader(event, "accept");

    const isFullResponse = acceptHeader === "application/vnd.projectrc+full";

    if (projectRC.readme) {
      let readmeUrl = `https://api.github.com/repos/${owner}/${name}`;
      if (typeof projectRC.readme === "string") {
        readmeUrl += `/contents/${projectRC.readme}`;
      } else {
        readmeUrl += "/readme";
      }

      const { content: markdown, encoding } = await $fetch<{
        content: string
        encoding: string
      }>(readmeUrl, {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      });

      response.readme = readmeUrl;

      if (isFullResponse) {
        if (encoding !== "base64") {
          console.error("Unknown encoding", encoding);
        }
        response.readme = Buffer.from(markdown, "base64").toString("utf-8");
      }
    }

    if (projectRC.npm) {
      let packageJsonUrl = `https://api.github.com/repos/${owner}/${name}`;
      if (typeof projectRC.npm === "string") {
        packageJsonUrl += `/contents/${projectRC.npm}`;
      } else {
        packageJsonUrl += "/contents/package.json";
      }

      const { content: packageJson, encoding } = await $fetch<{
        content: string
        encoding: string
      }>(packageJsonUrl, {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      });

      if (encoding !== "base64") {
        console.error("Unknown encoding", encoding);
      }

      const pkgJson: Record<string, unknown> = JSON.parse(
        Buffer.from(packageJson, "base64").toString("utf-8"),
      );

      if ("name" in pkgJson && typeof pkgJson?.name === "string") {
        try {
          await $fetch(`https://registry.npmjs.org/${pkgJson.name}`, {
            headers: {
              Accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
            },
          });
          response.npm = `https://npmjs.org/package/${pkgJson.name}`;
        } catch (err) {
          console.error("Package doesn't exist on npm. skipping..");
        }
      }

      if (isFullResponse) {
        response.packageJSON = pkgJson;
      }
    }

    return response;
  } catch (err) {
    return serverError(event, err);
  }
});
