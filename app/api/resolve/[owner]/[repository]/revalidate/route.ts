import { revalidatePath } from "next/cache";
import { env } from "~/env.mjs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.REVALIDATE_TOKEN}`) {
    return new Response(JSON.stringify({
      error: "not authorized",
    }), {
      status: 403,
    });
  }

  revalidatePath("/api/resolve/[owner]/[repository]");
  revalidatePath("/api/resolve/[owner]/[repository]/config");
  revalidatePath("/api/resolve/[owner]/[repository]/readme/[[...path]]");

  return Response.json({
    revalidated: true,
    lastUpdated: new Date().toISOString(),
    message: "revalidated /api/resolve/[owner]/[repository] and all subpaths",
  });
}
