// eslint-disable-next-line unused-imports/no-unused-vars
export async function GET(request: Request, { params }: {
  params: {
    owner: string
    repository: string
  }
}) {
  // for (const [key, value] of request.headers.entries()) {
  // console.log(key, value);
  // }

  return Response.json({
    error: "repository not found",
  }, {
    status: 404,
  });
}
