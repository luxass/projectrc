import process from "node:process";

export default defineCachedEventHandler(() => {
  return PROJECTRC_TYPEBOX_SCHEMA;
}, {
  shouldBypassCache() {
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    return false;
  },
  maxAge: 3600, // 1 hour
});
