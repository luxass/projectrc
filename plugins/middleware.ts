// i couln't get the vercel.json rewrites to work. so i'm using this instead.
export default defineNuxtPlugin(() => {
  addRouteMiddleware("*", (to) => {
    if (to.path === "/schema" || to.path === "/schema.json") {
      return navigateTo("/api/schema", { replace: false });
    }
  }, { global: true });
});
