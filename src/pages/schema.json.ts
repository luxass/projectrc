import type { APIRoute } from "astro";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { PROJECTRC_SCHEMA } from "../lib/json-schema";

export const GET: APIRoute = () => {
  const jsonSchema = zodToJsonSchema(PROJECTRC_SCHEMA.merge(z.object({
    $schema: z.string({
      description: "Ignored. Can be set to get completions, validations and documentation in some editors.",
    }).default("https://projectrc.luxass.dev/schema.json"),
  })));
  return new Response(JSON.stringify(jsonSchema, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
