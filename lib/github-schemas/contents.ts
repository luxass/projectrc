import { z } from "zod";

export const GITHUB_CONTENTS_SCHEMA = z
  .object({
    type: z.string(),
    size: z.number().int(),
    name: z.string(),
    path: z.string(),
    sha: z.string(),
    url: z.string().url(),
    git_url: z.union([z.string().url(), z.null()]),
    html_url: z.union([z.string().url(), z.null()]),
    download_url: z.union([z.string().url(), z.null()]),
    entries: z
      .array(
        z.object({
          type: z.string(),
          size: z.number().int(),
          name: z.string(),
          path: z.string(),
          content: z.string().optional(),
          sha: z.string(),
          url: z.string().url(),
          git_url: z.union([z.string().url(), z.null()]),
          html_url: z.union([z.string().url(), z.null()]),
          download_url: z.union([z.string().url(), z.null()]),
          _links: z.object({
            git: z.union([z.string().url(), z.null()]),
            html: z.union([z.string().url(), z.null()]),
            self: z.string().url(),
          }),
        }),
      )
      .optional(),
    _links: z.object({
      git: z.union([z.string().url(), z.null()]),
      html: z.union([z.string().url(), z.null()]),
      self: z.string().url(),
    }),
  })
  .describe("Content Tree");
