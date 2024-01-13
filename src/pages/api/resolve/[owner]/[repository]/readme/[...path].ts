import type { APIRoute } from "astro";
import { getREADME } from "~/lib/readme";

export const GET: APIRoute = async ({ params }) => {
  const { owner, repository, path } = params;

  if (!owner || !repository) {
    return new Response("missing params", {
      status: 400,
    });
  }

  const readme = await getREADME({
    owner,
    repository,
    readmePath: path,
  });

  return Response.json({
    lastModified: new Date().toISOString(),
    ...readme,
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "max-age=3600",
    },
  });
};

// import { getREADME } from "~/lib/readme";

// export interface RouteParams {
//   owner: string
//   repository: string
//   path?: string[]
// }

// export const revalidate = 3600;
// export const dynamic = "force-static";

// export async function GET(
//   _: Request,
//   { params }: { params: RouteParams },
// ) {
//   const { owner, repository, path = [] } = params;

//   const readme = await getREADME({
//     owner,
//     repository,
//     readmePath: path.join("/"),
//   });

//   return Response.json({
//     lastModified: new Date().toISOString(),
//     ...readme,
//   });
// }
