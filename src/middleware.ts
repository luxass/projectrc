import { defineMiddleware } from "astro:middleware";
import { getRepositoryType } from "./lib/repository";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith("/api/v1/resolve/")) {
    return next();
  }

  if (!context.params || !context.params.owner || !context.params.repository) {
    return Response.json(
      {
        error: "missing params",
      },
      {
        status: 400,
      },
    );
  }

  const { owner, repository } = context.params;
  const repositoryType = await getRepositoryType(owner, repository);

  if (!repositoryType) {
    return Response.json(
      {
        error: "repository not found",
      },
      {
        status: 404,
      },
    );
  }

  if (repositoryType !== "public") {
    return Response.json(
      {
        error: "repository is not public",
      },
      {
        status: 403,
      },
    );
  }

  return next();
});
