import type { APIRoute } from "astro";
import { remark } from "remark";
import { getREADME } from "~/lib/readme";
import { BADGE_REMOVER, COMMENT_REMOVER, UNUSED_DEFINITION_REMOVER, URL_REWRITER } from "~/lib/remark-plugins";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
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

  if (!readme) {
    return new Response("not found", {
      status: 404,
    });
  }

  const xMDX = request.headers.get("X-MDX");

  if (xMDX) {
    const file = await remark()
      .use(URL_REWRITER, {
        repoUrl: `https://github.com/${owner}/${repository}`,
      })
      .use(BADGE_REMOVER)
      .use(UNUSED_DEFINITION_REMOVER)
      .use(COMMENT_REMOVER)
      .process(readme.content || "No README was found.");

    const mdx = file.toString();

    return Response.json(
      {
        lastModified: new Date().toISOString(),
        path: readme?.path,
        content: mdx,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=3600, must-revalidate",
        },
      },
    );
  }

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
  );
};
