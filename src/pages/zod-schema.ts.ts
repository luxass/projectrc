import type { APIRoute } from "astro"
import ZOD_SCHEMA from "../lib/schema?raw"

export const GET: APIRoute = () => {
  return new Response(ZOD_SCHEMA, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  })
}
