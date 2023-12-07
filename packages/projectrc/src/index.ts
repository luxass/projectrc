export type { ResolveConfigOptions } from "./config";
export {
  CONFIG_FILE_NAMES,
  resolveConfig,
} from "./config";

export type { READMEOptions, READMEResult } from "./readme";
export {
  getREADME,
} from "./readme";

export type { ExistsOptions, RepositoryOptions } from "./repository";
export {
  getRepository,
  repositoryExists,
} from "./repository";

export type { ProjectRCResponse, ResolveOptions } from "./resolve";
export {
  resolve,
} from "./resolve";

export type { ProjectRCFile } from "./types";
export { SCHEMA } from "./schema";
