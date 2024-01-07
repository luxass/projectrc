import type { z } from "zod";
import type { PROJECTRC_SCHEMA } from "./schema";
import type { READMEResult } from "./readme";

type SafeOmit<T, K extends keyof T> = Omit<T, K>;

export interface ProjectRCResponse {
  $projectrc: z.infer<typeof PROJECTRC_SCHEMA> & {
    $gitPath: string
    $path: string
  }
  projects: ProjectRCProject[]
}

export interface Extras {
  stars?: number
  version?: {
    tag: string
    url: string
  }
  deprecated?: {
    message: string
    replacement?: string
  }
  npm?: {
    name?: string
    url?: string
    downloads?: number
  }
}

export type ProjectRCProject = (SafeOmit<z.infer<typeof PROJECTRC_SCHEMA>, "readme" | "workspace" | "extras"> & {
  name: string
  readme?: READMEResult
  extras?: Extras
});
