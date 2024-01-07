import { revalidatePath } from "next/cache";

export async function GET() {
  revalidatePath("/projects");

  return Response.json({
    message: "revalidated /projects",
  });
}
