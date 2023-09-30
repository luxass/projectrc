import projectrcSchema from "../../assets/schema.json";

export default defineEventHandler(async (event) => {
  return projectrcSchema;
});
