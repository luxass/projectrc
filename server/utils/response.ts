import type { H3Event } from "h3";

export function notFound(event: H3Event): string {
  setResponseHeader(event, "Content-Type", "text/plain");
  setResponseStatus(event, 404);
  return "Not found";
}

export function badRequest(event: H3Event): string {
  setResponseHeader(event, "Content-Type", "text/plain");
  setResponseStatus(event, 400);
  return "Bad request";
}

export function serverError(event: H3Event, err: unknown): string {
  console.error(err);
  setResponseHeader(event, "Content-Type", "text/plain");
  setResponseStatus(event, 500);
  return "Internal server error";
}
