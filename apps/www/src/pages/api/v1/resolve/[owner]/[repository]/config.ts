import type { APIRoute } from "astro";
import { resolveConfig } from "@luxass/mosaic";
import { GITHUB_TOKEN } from "astro:env/server";
import { createError } from "~/lib/response-utils";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { owner, repository } = params;

  if (!owner || !repository) {
    return createError({
      status: 400,
      message: "missing params",
    });
  }

  const config = await resolveConfig({
    owner,
    repository,
    githubToken: GITHUB_TOKEN,
    external: {
      owner: "luxass",
      repo: "luxass/luxass",
    },
  });

  if (!config) {
    return createError({
      message: "repository has no config defined",
      status: 404,
    });
  }

  if (config.type === "error") {
    return createError({
      message: "error resolving config due to config not being valid",
      status: 500,
      data: config.issues,
    });
  }

  return Response.json(
    {
      lastModified: new Date().toISOString(),
      content: config.content,
      external: config.external,
      path: config.path,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, must-revalidate",
      },
    },
  );
};
