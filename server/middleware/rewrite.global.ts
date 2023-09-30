export default defineNuxtRouteMiddleware((to) => {
  if (to === "/schema" || to === "/schema.json") {
    return "/api/schema";
  }
});
