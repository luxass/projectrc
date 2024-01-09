import { getREADME } from "~/lib/readme";

export interface RouteParams {
  owner: string
  repository: string
  path?: string[]
}

export const revalidate = 3600;

export async function GET(
  _: Request,
  { params }: { params: RouteParams },
) {
  const { owner, repository, path = [] } = params;

  const readme = await getREADME({
    owner,
    repository,
    readmePath: path.join("/"),
  });

  return Response.json({
    lastModified: new Date().toISOString(),
    ...readme,
  });
}
