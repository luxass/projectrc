// @ts-check
import process from "process";

import { z } from "zod";

export const envSchema = z.object({
  GITHUB_TOKEN: z.string(),
  VERCEL_URL: z.string().optional(),
  REVALIDATE_TOKEN: z.string(),
});

export const env = envSchema.parse(process.env);
