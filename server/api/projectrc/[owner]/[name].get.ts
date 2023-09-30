import process from "node:process";
import { graphql } from "@octokit/graphql";
import type { Static } from "@sinclair/typebox";

function gql(raw: TemplateStringsArray, ...keys: string[]): string {
  return keys.length === 0 ? raw[0]! : String.raw({ raw }, ...keys);
}

const PROJECTRC_NAMES: string[] = [
  ".projectrc",
  ".projectrc.json",
];

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
  if (!event.context.params) {
    return new Response("Not found", { status: 404 });
  }
  const { owner, name } = event.context.params;

  try {
    await $fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: {
        "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      ignoreResponseErrors: true,
    });
  } catch (err) {
    return new Response("Not found", { status: 404 });
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

  const projectrcFile = object?.entries.find((entry) => PROJECTRC_NAMES.includes(entry.name));

  if (!projectrcFile) {
    return new Response("Not found", { status: 404 });
  }

  const defaultBranch = repository.defaultBranchRef?.name || "main";

  const projectrcContent = await $fetch(
    `${repository.url}/blob/${defaultBranch}/${projectrcFile.path}?raw=true`,
  );

  if (!projectrcContent || typeof projectrcContent !== "string") {
    return new Response("Not found", { status: 404 });
  }

  if (!PROJECTRC_VALIDATE(JSON.parse(projectrcContent))) {
    return new Response("Not found", { status: 404 });
  }

  const projectRC = JSON.parse(projectrcContent) as Static<typeof PROJECTRC_TYPEBOX_SCHEMA>;

  return new Response(
    JSON.stringify(projectRC),
    { status: 200 },
  );
});
