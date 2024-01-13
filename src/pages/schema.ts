import type { APIRoute } from "astro";
import { zodToJsonSchema } from "zod-to-json-schema";
import { PROJECTRC_SCHEMA } from "~/lib/schema";

export const GET: APIRoute = () => {
  const jsonSchema = zodToJsonSchema(PROJECTRC_SCHEMA);
  return new Response(JSON.stringify(jsonSchema), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "max-age=3600",
    },
  });
};
