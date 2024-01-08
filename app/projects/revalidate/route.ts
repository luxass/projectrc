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

  revalidatePath("/projects");
  revalidatePath("/resolve/[owner]/[repository]");

  return Response.json({
    message: "revalidated /projects",
  });
}
