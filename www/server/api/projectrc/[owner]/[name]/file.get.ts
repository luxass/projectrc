import process from "node:process";
import { exists, getProjectRCFile } from "@luxass/projectrc";

export default defineCachedEventHandler(async (event) => {
  try {
    if (!event.context.params) {
      return notFound(event);
    }
    const { owner, name } = event.context.params;
    if (!ALLOWED_OWNERS.includes(owner) || BLOCKED_REPOSITORIES.includes(name)) {
      return notFound(event);
    }

    if (!(await exists(owner, name))) {
      return notFound(event);
    }

    const projectrcFile = await getProjectRCFile(owner, name);

    if (!projectrcFile) {
      return notFound(event);
    }

    return projectrcFile.content;
  } catch (err) {
    return serverError(event, err);
  }
}, {
  shouldBypassCache: () => process.env.NODE_ENV === "development",
  maxAge: 3600, // 1 hour
});
