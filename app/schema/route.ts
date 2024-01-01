import { toJSONSchema } from "@gcornut/valibot-json-schema";
import { SCHEMA } from "~/lib/schema";

export async function GET() {
  const jsonSchema = toJSONSchema({
    schema: SCHEMA,
  });
  return new Response(JSON.stringify(jsonSchema, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
