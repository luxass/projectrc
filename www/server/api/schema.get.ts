import process from "node:process";
import SCHEMA from "@luxass/projectrc/json-schema";

export default defineCachedEventHandler(async () => {
  return SCHEMA;
}, {
  maxAge: 3600, // 1 hour
  shouldBypassCache() {
    return process.env.NODE_ENV === "development";
  },
});
