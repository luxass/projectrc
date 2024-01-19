import type { APIRoute } from "astro"
import { internalResolve } from "~/lib/resolve"

export const prerender = false

export const GET: APIRoute = ({ params }) => {
  const { owner, repository: repositoryName } = params

  if (!owner || !repositoryName) {
    return new Response("missing params", {
      status: 400,
    })
  }

  return internalResolve(owner, repositoryName)
}
