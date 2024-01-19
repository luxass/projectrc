import type { APIRoute } from "astro"
import { getREADME } from "~/lib/readme"

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { owner, repository, path } = params

  if (!owner || !repository) {
    return new Response("missing params", {
      status: 400,
    })
  }

  const readme = await getREADME({
    owner,
    repository,
    readmePath: path,
  })

  return Response.json(
    {
      lastModified: new Date().toISOString(),
      ...readme,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, must-revalidate",
      },
    },
  )
}
