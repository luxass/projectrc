import type { APIRoute } from "astro";
import { Octokit } from "@octokit/rest";
import { consola } from "consola";
import { remark } from "remark";
import { getProjects } from "~/lib/projects";
import { METADATA } from "~/lib/remark-plugins";

export const prerender = false;

const ICONS = new Map<string, string>();

interface GitTree {
  /** @description The file referenced in the tree. */
  path?: string;
  /**
   * @description The file mode; one of `100644` for file (blob), `100755` for executable (blob), `040000` for subdirectory (tree), `160000` for submodule (commit), or `120000` for a blob that specifies the path of a symlink.
   * @enum {string}
   */
  mode?: "100644" | "100755" | "040000" | "160000" | "120000";
  /**
   * @description Either `blob`, `tree`, or `commit`.
   * @enum {string}
   */
  type?: "blob" | "tree" | "commit";
  /**
   * @description The SHA1 checksum ID of the object in the tree. Also called `tree.sha`. If the value is `null` then the file will be deleted.
   *
   * **Note:** Use either `tree.sha` or `content` to specify the contents of the entry. Using both `tree.sha` and `content` will return an error.
   */
  sha?: string | null;
  /**
   * @description The content you want this file to have. GitHub will write this blob out and use that SHA for this entry. Use either this, or `tree.sha`.
   *
   * **Note:** Use either `tree.sha` or `content` to specify the contents of the entry. Using both `tree.sha` and `content` will return an error.
   */
  content?: string;
};

export const GET: APIRoute = async ({ request }) => {
  const headers = request.headers;

  const token = headers.get("authorization");

  if (token !== import.meta.env.AUTHORIZATION_TOKEN) {
    consola.warn(`invalid token: ${token}`);
    return Response.json({ error: "invalid token" }, { status: 403 });
  }

  try {
    const octokit = new Octokit({ auth: import.meta.env.COMMIT_TOKEN });

    const { data: commits } = await octokit.repos.listCommits({
      owner: "luxass",
      repo: "luxass.dev",
      per_page: 1, // Get only the latest commit
    });

    const latestCommitSHA = commits[0].sha;

    const contentPath = "src/content/projects";

    const { data: { tree: projectsTree } } = await octokit.git.getTree({
      owner: "luxass",
      repo: "luxass.dev",
      tree_sha: `main:${contentPath}`,
      recursive: "1",
    });

    const updatedTree: GitTree[] = projectsTree
      .filter(({ type, path }) => type === "blob" && !path?.endsWith(".gitkeep"))
      .map(({ path, mode, type }) => ({
        path: `${contentPath}/${path}`,
        sha: null,
        mode: mode as GitTree["mode"],
        type: type as GitTree["type"],
      }));

    const projects = await getProjects();

    if (!projects) {
      return Response.json({ error: "no projects found" }, { status: 500 });
    }

    for (const project of projects.filter((project) => project.readme)) {
      const fileName = project.name.replace(/^\./, "").replace(/\./g, "-");
      if (!project.readme) {
        consola.warn(`no README found for ${project.name}`);
        continue;
      }

      const readmeContent: unknown = await fetch(project.readme, {
        headers: {
          "X-MDX": "true",
        },
      }).then((res) => res.json());

      if (!readmeContent || typeof readmeContent !== "object" || !("content" in readmeContent) || typeof readmeContent.content !== "string") {
        consola.error(`No README found for ${project.name}`);
        continue;
      }
      const file = await remark()
        .use(METADATA, {
          name: project.name,
          icons: ICONS,
        })
        .process(readmeContent.content || "No README was found.");

      const frontmatter = `---
                  handle: ${project.name}
                  name: ${project.name}
                  owner: ${project.nameWithOwner.split("/")[0]}
                  ${project.description ? `description: ${project.description}` : ""}
                  githubUrl: ${project.url}
                  ${project.npm ? `npm: "${project.npm.name}"` : ""}
                  ${ICONS.has(project.name) ? `icon: ${ICONS.get(project.name)}` : ""}
                  ---`
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n");

      // check if updatedTree already contains the file based on fileName
      const existingFile = updatedTree.find((file) => file.path === `${contentPath}/${fileName}.mdx`);

      if (!existingFile) {
        updatedTree.push({
          path: `${contentPath}/${fileName}.mdx`,
          mode: "100644",
          type: "blob",
          content: `${frontmatter}\n\n${file.toString()}`,
        });
        consola.success(`added ${fileName}`);
      } else {
        if (existingFile?.sha === null) {
          delete existingFile?.sha;
        }

        existingFile!.content = `${frontmatter}\n\n${file.toString()}`;
        consola.success(`updated ${fileName}`);
      }
    }

    const newTree = await octokit.git.createTree({
      owner: "luxass",
      repo: "luxass.dev",
      base_tree: latestCommitSHA,
      tree: updatedTree,
    });

    const newCommit = await octokit.git.createCommit({
      owner: "luxass",
      repo: "luxass.dev",
      message: "chore: update list of projects",
      tree: newTree.data.sha,
      parents: [latestCommitSHA],
    });

    await octokit.git.updateRef({
      owner: "luxass",
      repo: "luxass.dev",
      ref: "heads/main",
      sha: newCommit.data.sha,
    });

    return Response.json({
      message: "OK",
    });
  } catch (err) {
    consola.error(err);
    return Response.json({ error: "internal server error" }, { status: 500 });
  }
};
