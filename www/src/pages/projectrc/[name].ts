import type { APIRoute } from "astro";
import { resolve } from "@luxass/projectrc";

export const GET: APIRoute = async ({ params }) => {
  const name = params.name;
  if (!name) {
    return new Response("Not Found", { status: 404 });
  }

  const projectRC = await resolve({
    owner: "luxass",
    repository: name,
    githubToken: import.meta.env.GITHUB_TOKEN,
  });

  if (!projectRC) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(
    JSON.stringify(projectRC),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600",
      },
    },
  );
};
