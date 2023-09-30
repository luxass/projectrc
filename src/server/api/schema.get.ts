import projectrcSchema from "../../public/assets/schema.json";

export default defineEventHandler(async (event) => {
  return projectrcSchema;
});
