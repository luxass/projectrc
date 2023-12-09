import type { APIRoute } from "astro";
import SCHEMA from "@luxass/projectrc/json-schema";

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(SCHEMA), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
