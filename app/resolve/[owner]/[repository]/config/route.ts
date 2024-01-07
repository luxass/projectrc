import { resolveConfig } from "~/lib/config";
import { getRepositoryType } from "~/lib/repository";

interface RouteParams {
  owner: string
  repository: string
}

export async function GET(
  _: Request,
  { params }: { params: RouteParams },
) {
  const { owner, repository: repositoryName } = params;

  const repositoryType = await getRepositoryType(owner, repositoryName);

  if (!repositoryType) {
    return Response.json({
      error: "Repository not found",
    }, {
      status: 404,
    });
  }

  if (repositoryType !== "public") {
    return Response.json({
      error: "Repository is not public",
    }, {
      status: 403,
    });
  }

  if (owner !== "luxass") {
    return Response.json({
      error: "Repository is not owned by luxass",
    }, {
      status: 403,
    });
    // resolve repository externally in my luxass/luxass repo
  }

  const config = await resolveConfig(owner, repositoryName);

  if (!config) {
    return Response.json({
      error: "Repository has no config",
    }, {
      status: 404,
    });
  }

  return Response.json(config?.content);
}
