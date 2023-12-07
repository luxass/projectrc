import { Buffer } from "node:buffer";
import type { HttpHandler } from "msw";
import { HttpResponse, delay, http } from "msw";

export const contentsHTTPHandler
  = http.get<{
    owner: string
    name: string
    "0": string
  }>(
    "https://api.github.com/repos/:owner/:name/contents/*",
    async ({ params }) => {
      const files = params["0"];

      if (!params.owner || !params.name || !files) {
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

      const repo = GitHubMockedData.get(`${params.owner}/${params.name}`);

      if (!repo || !repo.files) {
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

      const repoFiles = Object.keys(repo.files);

      if (!repoFiles.includes(files)) {
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

      const project = repo.files[files];

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
  ) satisfies HttpHandler;
