import type { Input } from "valibot";
import { SCHEMA } from "./schema";

import { CONFIG_FILE_NAMES, getProjectRCFile } from "./config";
import { REPOSITORY_QUERY, exists, getRepository } from "./utils";

export type { ProjectRCFile } from "./config";

export { REPOSITORY_QUERY, exists, getRepository };
export { SCHEMA, CONFIG_FILE_NAMES, getProjectRCFile };

export type ProjectRCResponse = { $raw: Input<typeof SCHEMA>; $path: string } & Input<typeof SCHEMA>;

export async function getProjectRC(owner: string, name: string): Promise<ProjectRCResponse | undefined> {
  if (!owner || !name) return undefined;
  if (!(await exists(owner, name))) return undefined;

  const projectrcFile = await getProjectRCFile(owner, name);
  if (!projectrcFile) return undefined;

  const repository = await getRepository(owner, name);
  if (!repository) return undefined;

  return {
    $raw: projectrcFile?.content || {},
    $path: projectrcFile?.path || "",
    handles: projectrcFile?.content?.handles,
  };
}
