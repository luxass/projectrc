import type { Static } from "@sinclair/typebox";

export interface ProjectRCResponse {
  raw: Static<typeof PROJECTRC_TYPEBOX_SCHEMA>
  // readme is either a url or a full text content, based on the Accept header.
  readme?: string
  npm?: string
  // packageJSON is only returned if full response is requested based on the Accept header.
  packageJSON?: Record<string, unknown>
  website?: string | null
}

export interface LanguageNode {
  name: string
  color: string
}

export interface ObjectEntry {
  name: string
  type: "blob" | "tree"
  path: string
}

export interface RepositoryNode {
  name: string
  homepageUrl: string
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
