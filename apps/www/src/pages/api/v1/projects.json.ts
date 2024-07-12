import type { APIRoute } from "astro";
import { getProjects } from "~/lib/projects";
import { createError } from "~/lib/response-utils";

export const prerender = false;

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "public, s-maxage=3600, must-revalidate",
};

export const GET: APIRoute = async () => {
  try {
    const projects = await getProjects();

    if (!projects) {
      return createError({
        message: `no repositories found`,
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
    console.error(err);
    return createError({
      message: "Internal Server Error",
      status: 500,
      headers: HEADERS,
    });
  }
};
