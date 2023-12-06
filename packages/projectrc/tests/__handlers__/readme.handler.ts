import { Buffer } from "node:buffer";
import type { HttpHandler } from "msw";
import { HttpResponse, delay, http } from "msw";

export const readmeHandlers = [
  http.get<{
    owner: string
    repository: string
  }>(
    "https://api.github.com/repos/:owner/:repository/readme",
    async ({ params }) => {
      if (!params.owner || !params.repository) {
        return HttpResponse.json(
          {
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/repos/contents#get-repository-content",
          },
          {
            status: 404,
          },
        );
      }

      await delay();
      const repo = GitHubMockedData.get(
        `${params.owner}/${params.repository}`,
      );

      if (!repo) {
        return HttpResponse.json(
          {
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/repos/contents#get-repository-content",
          },
          {
            status: 404,
          },
        );
      }

      const files = Object.keys(repo);

      if (!files.includes("README.md")) {
        return HttpResponse.json(
          {
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/repos/contents#get-repository-content",
          },
          {
            status: 404,
          },
        );
      }

      const project = repo["README.md"];

      if (!project) {
        return HttpResponse.json(
          {
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/repos/contents#get-repository-content",
          },
          {
            status: 404,
          },
        );
      }

      const content
        = typeof project.content === "object"
          ? JSON.stringify(project.content)
          : project.content;

      return HttpResponse.json({
        content: Buffer.from(content).toString("base64"),
      });
    },
  ),
] satisfies HttpHandler[];
