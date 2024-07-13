export type { ResolveConfigOptions } from "./config";
export { resolveConfig } from "./config";
export type { READMEOptions, READMEResult } from "./readme";
export { getREADME } from "./readme";

export type {
  ExternalRepositoriesOptions,
  RepositoryOptions,
  RepositoryType,
  RepositoryTypeOptions,
} from "./repository";
export {
  getRepository,
  getRepositoryType,
  getExternalRepositories,
} from "./repository";

// export type { ProjectRCResponse, ResolveOptions } from "./resolve";
// export { resolveProjectRC } from "./resolve";

export {
  DEPRECATED_SCHEMA,
  MOSAIC_SCHEMA,
  NPM_SCHEMA,
  PROJECT_SCHEMA,
  README_SCHEMA,
  WEBSITE_SCHEMA,
  WORKSPACE_SCHEMA,
} from "./schema";
