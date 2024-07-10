import type { APIRoute } from "astro";
import { getProjects } from "~/lib/projects";

export const prerender = false;

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "public, s-maxage=3600, must-revalidate",
};

export const GET: APIRoute = async () => {
  try {
    const projects = await getProjects();

    if (!projects) {
      return Response.json({
        message: `no repositories found`,
        status: 404,
        timestamp: new Date().toISOString,
      }, {
        status: 404,
        headers: HEADERS,
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
      message,
      status: 500,
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
      headers: HEADERS,
    });
  }
};
