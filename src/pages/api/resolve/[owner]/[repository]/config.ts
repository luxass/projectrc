import type { APIRoute } from "astro";
import { resolveConfig } from "~/lib/config";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { owner, repository } = params;

  if (!owner || !repository) {
    return new Response("missing params", {
      status: 400,
    });
  }

  const config = await resolveConfig(owner, repository);

  if (!config) {
    return Response.json({
      error: "repository has no config",
    }, {
      status: 404,
    });
  }
  return Response.json({
    lastModified: new Date().toISOString(),
    ...config,
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "max-age=3600",
    },
  });
};
