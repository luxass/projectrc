import { z } from "zod";

export const PACKAGE_JSON_SCHEMA = z.object({
  name: z
    .string()
    .regex(/^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/)
    .min(1)
    .max(214)
    .describe("The name of the package.")
    .optional(),
  version: z
    .string()
    .describe("Version must be parseable by node-semver, which is bundled with npm as a dependency.")
    .optional(),
  private: z.boolean().describe("If set to true, then npm will refuse to publish it.").optional(),
  workspaces: z
    .array(z.string())
    .describe(
      "Allows packages within a directory to depend on one another using direct linking of local files. Additionally, dependencies within a workspace are hoisted to the workspace root when possible to reduce duplication. Note: It's also a good idea to set \"private\" to true when using this feature.",
    )
    .optional(),
});
