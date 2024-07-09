import type { APIRoute } from "astro";
import { getProjects } from "../../lib/projects";

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "public, s-maxage=3600, must-revalidate",
};

export const GET: APIRoute = async () => {
  try {
    const projects = await getProjects();

    if (!projects) {
      return Response.json({
        error: `no repositories found`,
      }, {
        status: 404,
      });
    }

    return Response.json({
      lastModified: new Date().toISOString(),
      projects,
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
