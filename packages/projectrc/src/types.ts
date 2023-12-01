import type { Input } from "valibot";
import type { SCHEMA } from "./schema";

export interface ProjectRCFile {
  content: Input<typeof SCHEMA>
  path: string
}
