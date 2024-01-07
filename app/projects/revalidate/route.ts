import { revalidatePath } from "next/cache";

export async function GET() {
  revalidatePath("/projects");
  revalidatePath("/resolve/[owner]/[repository]");

  return Response.json({
    message: "revalidated /projects",
  });
}
