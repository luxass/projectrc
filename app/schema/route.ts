import { zodToJsonSchema } from "zod-to-json-schema";
import { PROJECTRC_SCHEMA } from "~/lib/schema";

export async function GET() {
  const jsonSchema = zodToJsonSchema(PROJECTRC_SCHEMA);
  return new Response(JSON.stringify(jsonSchema, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
