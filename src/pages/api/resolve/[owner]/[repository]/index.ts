import type { APIRoute } from "astro";
import { ERROR_MAP, getRepositoryProjects } from "~/lib/repository-projects";

export const prerender = false;

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "public, s-maxage=3600, must-revalidate",
};

export const GET: APIRoute = async ({ params }) => {
  try {
    const { owner, repository: repositoryName } = params;

    if (!owner || !repositoryName) {
      return new Response("missing params", {
        status: 400,
      });
    }

    const result = await getRepositoryProjects(owner, repositoryName);

    if (!Array.isArray(result)) {
      return Response.json({
        error: ERROR_MAP[result.error],
      }, {
        status: 404,
        headers: HEADERS,
      });
    }

    return Response.json({
      lastModified: new Date().toISOString(),
      projects: result,
    }, {
      headers: HEADERS,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({
      error: message,
    }, {
      status: 500,
      headers: HEADERS,
    });
  }
};
