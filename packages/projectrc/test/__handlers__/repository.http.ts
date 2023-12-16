import type { HttpHandler } from "msw";
import { HttpResponse, delay, http } from "msw";

export const repositoryHTTPHandler = http.get<{
  owner: string
  repository: string
}>("https://api.github.com/repos/:owner/:repository", async ({ params }) => {
  if (!params.owner || !params.repository) {
    return HttpResponse.json(
      {
        message: "Not Found",
        documentation_url:
          "https://docs.github.com/rest/repos/repos#get-a-repository",
      },
      {
        status: 404,
      },
    );
  }

  await delay();
  const repo = GitHubMockedData.get(`${params.owner}/${params.repository}`);

  if (!repo) {
    return HttpResponse.json(
      {
        message: "Not Found",
        documentation_url:
          "https://docs.github.com/rest/repos/repos#get-a-repository",
      },
      {
        status: 404,
      },
    );
  }

  return HttpResponse.json(repo.data || {});
}) satisfies HttpHandler;
