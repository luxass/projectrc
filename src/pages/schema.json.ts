import type { APIRoute } from 'astro'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { PROJECTRC_SCHEMA } from '~/lib/json-schema'

export const GET: APIRoute = () => {
  const jsonSchema = zodToJsonSchema(PROJECTRC_SCHEMA)
  return new Response(JSON.stringify(jsonSchema), {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
}
