import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRepositoryType } from "./lib/repository";

export async function middleware(request: NextRequest) {
  const reqUrl = new URL(request.url);
  const pathname = new URL(request.nextUrl).pathname;
  const [_, owner, repository] = pathname.replace("/api/resolve", "").split("/");
  const data: Record<string, string> = {};

  const repositoryType = await getRepositoryType(owner, repository);

  data["ctx-repository-type"] = repositoryType || "unknown";

  if (!repositoryType) {
    return Response.json({
      error: "repository not found",
    }, {
      status: 404,
    });
  }

  if (repositoryType !== "public") {
    return Response.json({
      error: "repository is not public",
    }, {
      status: 403,
    });
  }

  const res = NextResponse.next();

  if (request.headers.get("Location")) {
    return res;
  }

  const rewriteURL = new URL(
    res.headers.get("x-middleware-rewrite") || request.url,
  );

  if (reqUrl.origin !== rewriteURL.origin) {
    return res;
  }

  // Set context directly on the res object (headers)
  // and on the rewrite url (query string)

  for (const key in data) {
    res.headers.set(key, data[key]);
    rewriteURL.searchParams.set(key, data[key]);
  }

  // set the updated rewrite url
  res.headers.set("x-middleware-rewrite", rewriteURL.href);

  return res;
}

export const config = {
  matcher: [
    "/api/resolve/:owner/:repository/:path*",
  ],
};
