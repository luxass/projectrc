import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response("Pong!", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
