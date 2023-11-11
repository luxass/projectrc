export default defineNuxtPlugin(() => {
  addRouteMiddleware("*", (to) => {
    if (to.path === "/view-source") {
      return navigateTo("https://github.com/luxass/projectrc", { replace: false });
    }

    if (to.path === "/schema" || to.path === "/schema.json") {
      return navigateTo("/api/schema", { replace: true });
    }
  }, { global: true });
});
