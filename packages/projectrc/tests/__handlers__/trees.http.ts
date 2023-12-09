import { Buffer } from "node:buffer";
import type { HttpHandler } from "msw";
import { HttpResponse, delay, http } from "msw";

interface FileTree {
  mode: string
  path: string
  sha: string
  type: "tree" | "blob"
  url: string
  size?: number | undefined
};

export const treesHTTPHandler = http.get<{
  owner: string
  name: string
}>(
  "https://api.github.com/repos/:owner/:name/git/trees/main",
  async ({ params }) => {
    if (!params.owner || !params.name) {
      return HttpResponse.json(
        {
          message: "Not Found",
          documentation_url: "https://docs.github.com/rest/git/trees#get-a-tree",
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
          documentation_url: "https://docs.github.com/rest/git/trees#get-a-tree",
        },
        {
          status: 404,
        },
      );
    }

    const files = Object.keys(repo.files);

    const trees: FileTree[] = [];

    files.forEach((fileName) => {
      const file = repo.files![fileName];

      if (!file) {
        throw new Error("File not found");
      }

      if (fileName.includes("/")) {
        // if my path is .github/workflows/ci.yml

        // i want to have .github pushed but also .github/workflows

        // so i need to split the path and push each part

        const paths = fileName.split("/");
        let path = "";
        for (const part of paths) {
          path += part;

          if (path === fileName) {
            break;
          }

          path += "/";
          if (trees.some((tree) => tree.path === path.slice(0, -1))) {
            continue;
          }

          trees.push({
            path: path.slice(0, -1),
            mode: "040000",
            type: "tree",
            sha: "1234",
            url: `https://api.github.com/repos/${params.owner}/${params.name}/git/trees/1234`,
          });
        }
      }

      trees.push({
        path: fileName,
        mode: "100644",
        type: "blob",
        sha: "1234",
        url: `https://api.github.com/repos/${params.owner}/${params.name}/git/blobs/1234`,
        size: Buffer.from(JSON.stringify(file.content)).byteLength,
      });
    });

    return HttpResponse.json({
      tree: trees.flat(),
      truncated: repo.truncated ?? false,
    });
  },
) satisfies HttpHandler;
