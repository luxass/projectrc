export default defineNuxtPlugin((nuxtApp) => {
  addRouteMiddleware("*", (to, from) => {
    if (to.path === "/schema" || to.path === "/schema.json") {
      return navigateTo("/api/schema", { replace: false });
    }
  }, { global: true });
});
