// i couln't get the middleware to work without this.. Probably a bug or im just dumb.
export default defineNuxtPlugin(() => {
  // addRouteMiddleware("*", (to) => {
  //   if (to.path === "/schema" || to.path === "/schema.json") {
  //     return navigateTo("/api/schema", { replace: false });
  //   }
  // }, { global: true });
});
