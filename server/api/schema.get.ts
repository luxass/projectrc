import process from "node:process";

export default defineCachedEventHandler(async () => {
  return PROJECTRC_TYPEBOX_SCHEMA;
}, {
  shouldBypassCache() {
    return process.env.NODE_ENV === "development";
  },
  maxAge: 3600, // 1 hour
});
