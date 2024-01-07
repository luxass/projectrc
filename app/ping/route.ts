export async function GET() {
  return new Response("Pong!", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
