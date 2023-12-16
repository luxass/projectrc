import type { HttpHandler } from "msw";
import { HttpResponse, bypass, http } from "msw";

export const npmDownloadsHTTPHandler = http.get(
  "https://api.npmjs.org/downloads/point/last-month/*",
  async ({ request }) => {
    const response = await fetch(bypass(request));
    const result = await response.json();

    return HttpResponse.json(result as any);
  },
) satisfies HttpHandler;
