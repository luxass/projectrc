import { resolveConfig } from "~/lib/config";

export interface RouteParams {
  owner: string
  repository: string
}

export const revalidate = 3600;

export async function GET(
  _: Request,
  { params }: { params: RouteParams },
) {
  const { owner, repository } = params;

  const config = await resolveConfig(owner, repository);

  if (!config) {
    return Response.json({
      error: "repository has no config",
    }, {
      status: 404,
    });
  }

  return Response.json({
    lastModified: new Date().toISOString(),
    ...config,
  });
}
