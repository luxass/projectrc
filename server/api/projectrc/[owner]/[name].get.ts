import process from "node:process";
import { Buffer } from "node:buffer";
import { graphql } from "@octokit/graphql";
import type { Static } from "@sinclair/typebox";

function gql(raw: TemplateStringsArray, ...keys: string[]): string {
  return keys.length === 0 ? raw[0]! : String.raw({ raw }, ...keys);
}

const PROJECTRC_NAMES: string[] = [".projectrc", ".projectrc.json"];

const ALLOWED_OWNERS: string[] = ["luxass"];

const BLOCKED_REPOSITORIES: string[] = [];

interface ProjectRCResponse {
  projectrc: Static<typeof PROJECTRC_TYPEBOX_SCHEMA>
  readme?: string
  npm?: Record<string, unknown>
}

const REPOSITORY_QUERY = gql`
  #graphql
  query getRepository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      isFork
      isPrivate
      nameWithOwner
      description
      pushedAt
      url
      defaultBranchRef {
        name
      }
      languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
        nodes {
          name
          color
        }
      }
      object(expression: "HEAD:.github") {
        ... on Tree {
          entries {
            name
            type
            path
          }
        }
      }
    }
  }
`;

interface LanguageNode {
  name: string
  color: string
}

interface ObjectEntry {
  name: string
  type: "blob" | "tree"
  path: string
}

interface RepositoryNode {
  name: string
  nameWithOwner: string
  description: string
  pushedAt: string
  url: string
  defaultBranchRef: {
    name: string
  }
  isPrivate: boolean
  isFork: boolean
  languages: {
    nodes: LanguageNode[]
  }
  object: {
    entries: ObjectEntry[]
  } | null
}

export default defineEventHandler(async (event) => {
  try {
    if (!event.context.params) {
      setResponseHeader(event, "Content-Type", "text/plain");
      setResponseStatus(event, 404);
      return "Not found";
    }
    const { owner, name } = event.context.params;
    if (!ALLOWED_OWNERS.includes(owner) || BLOCKED_REPOSITORIES.includes(name)) {
      setResponseHeader(event, "Content-Type", "text/plain");
      setResponseStatus(event, 404);
      return "Not found";
    }

    try {
      await $fetch(`https://api.github.com/repos/${owner}/${name}`, {
        headers: {
          "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      setResponseHeader(event, "Content-Type", "text/plain");
      setResponseStatus(event, 404);
      return "Not found";
    }

    const { repository } = await graphql<{
      repository: RepositoryNode
    }>(REPOSITORY_QUERY, {
      owner,
      name,
      headers: {
        "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const { object } = repository;

    const projectrcFile = object?.entries.find((entry) =>
      PROJECTRC_NAMES.includes(entry.name),
    );

    if (!projectrcFile) {
      setResponseHeader(event, "Content-Type", "text/plain");
      setResponseStatus(event, 404);
      return "Not found";
    }

    const defaultBranch = repository.defaultBranchRef?.name || "main";

    const projectrcContent = await $fetch(
      `${repository.url}/blob/${defaultBranch}/${projectrcFile.path}?raw=true`,
    );

    if (!projectrcContent || typeof projectrcContent !== "string") {
      setResponseHeader(event, "Content-Type", "text/plain");
      setResponseStatus(event, 404);
      return "Not found";
    }

    if (!PROJECTRC_VALIDATE(JSON.parse(projectrcContent))) {
      setResponseHeader(event, "Content-Type", "text/plain");
      setResponseStatus(event, 404);
      return "Not found";
    }

    const projectRC = JSON.parse(projectrcContent) as Static<
      typeof PROJECTRC_TYPEBOX_SCHEMA
    >;

    const response: ProjectRCResponse = {
      projectrc: projectRC,
    };

    if (projectRC.readme) {
      let readmeUrl = `https://api.github.com/repos/${owner}/${name}`;
      if (typeof projectRC.readme === "string") {
        readmeUrl += `/contents/${projectRC.readme}`;
      } else {
        readmeUrl += "/readme";
      }

      const { content: markdown, encoding } = await $fetch<{
        content: string
        encoding: string
      }>(readmeUrl, {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      });

      if (encoding !== "base64") {
        console.error("Unknown encoding", encoding);
      }
      response.readme = Buffer.from(markdown, "base64").toString("utf-8");
    }

    if (projectRC.npm) {
      let packageJsonUrl = `https://api.github.com/repos/${owner}/${name}`;
      if (typeof projectRC.npm === "string") {
        packageJsonUrl += `/contents/${projectRC.npm}`;
      } else {
        packageJsonUrl += "/contents/package.json";
      }

      const { content: packageJson, encoding } = await $fetch<{
        content: string
        encoding: string
      }>(packageJsonUrl, {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      });

      if (encoding !== "base64") {
        console.error("Unknown encoding", encoding);
      }
      response.npm = JSON.parse(
        Buffer.from(packageJson, "base64").toString("utf-8"),
      );
    }

    return response;
  } catch (err) {
    console.error(err);
    setResponseHeader(event, "Content-Type", "text/plain");
    setResponseStatus(event, 500);
    return "Internal server error";
  }
});
