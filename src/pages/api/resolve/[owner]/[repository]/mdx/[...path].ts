import type { APIRoute } from "astro";
import { remark } from "remark";
import { getREADME } from "~/lib/readme";
import { removeBadges } from "~/lib/remark-plugins/badge-remover";
import { removeComments } from "~/lib/remark-plugins/remove-comments";
import { rewriteUrls } from "~/lib/remark-plugins/url-rewriter";

export const prerender = false;

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

  if (!readme) {
    return new Response("not found", {
      status: 404,
    });
  }

  const file = await remark()
    .use(rewriteUrls({
      repoUrl: `https://github.com/${owner}/${repository}`,
    }))
    .use(removeBadges())
    .use(removeComments())
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
};
