import type { APIRoute } from "astro";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { MOSAIC_SCHEMA } from "../lib/json-schema";

export const GET: APIRoute = () => {
  const jsonSchema = zodToJsonSchema(MOSAIC_SCHEMA.merge(z.object({
    $schema: z.string({
      description: "Ignored. Can be set to get completions, validations and documentation in some editors.",
    }).default("https://mosaic.luxass.dev/json-schema"),
  })));
  return new Response(JSON.stringify(jsonSchema, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=3600, must-revalidate",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
