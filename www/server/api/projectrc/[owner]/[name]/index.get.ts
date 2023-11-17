import process from "node:process";
import { createProjectRCResolver } from "@luxass/projectrc";

export default defineCachedEventHandler(async (event) => {
  try {
    if (!event.context.params) {
      return notFound(event);
    }
    const { name, owner } = event.context.params;
    if (!ALLOWED_OWNERS.includes(owner) || BLOCKED_REPOSITORIES.includes(name)) {
      return notFound(event);
    }

    const resolver = createProjectRCResolver(process.env.GITHUB_TOKEN!);

    const projectRC = await resolver.resolve(owner, name);

    if (!projectRC) {
      return notFound(event);
    }

    return projectRC;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.startsWith("projectrc: ")) {
        return {
          error: err.message.replace("projectrc: ", ""),
        };
      }
    }
    return serverError(event, err);
  }
}, {
  maxAge: 3600, // 1 hour
  shouldBypassCache: () => process.env.NODE_ENV === "development",
});
