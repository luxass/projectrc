import { z } from "zod";

export const GITHUB_TREES_SCHEMA = z
  .object({
    sha: z.string(),
    url: z.string().url(),
    truncated: z.boolean(),
    tree: z
      .array(
        z.object({
          path: z.string().optional(),
          mode: z.string().optional(),
          type: z.string().optional(),
          sha: z.string().optional(),
          size: z
            .number()
            .int()
            .optional(),
          url: z.string().optional(),
        }),
      )
      .describe("Objects specifying a tree structure"),
  })
  .describe("The hierarchy between files in a Git repository.");
