<script setup lang="ts">
useHead({
  title: "projectrc",
});

useSeoMeta({
  description: "A site that describes what a .projectrc is.",
  ogTitle: "projectrc",
  ogDescription: "A site that describes what a .projectrc is.",

});

defineOgImage({
  title: "404",
  description: "Page not found",
});
</script>

<template>
  <div h-100dvh flex="~ col" gap-4 items-center justify-center>
    <h1 text="8xl blue-500">
      404
    </h1>
    <p mb-8 text-2xl>
      Page not found
    </p>
    <Link href="/">
      Go back
    </Link>
  </div>
</template>
