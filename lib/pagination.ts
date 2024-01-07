export function paginate<TResponse>(url?: string): AsyncIterable<TResponse> {
  return {
    async *[Symbol.asyncIterator]() {
      let nextUrl = url;

      if (!url) {
        throw new Error("url is required");
      }

      while (nextUrl) {
        const res = await fetch(nextUrl);

        const json = await res.json();
        nextUrl = res.headers.get("link")?.split(", ")
          .find((link) => link.endsWith("rel=\"next\""))?.split("; ")[0]?.slice(1, -1);
        yield json;
      }
    },
  };
}
