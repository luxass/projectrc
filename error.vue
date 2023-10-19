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
  <div class="h-100dvh flex gap-4 flex-col items-center justify-center">
    <h1 class="text-8xl text-blue-600">
      404
    </h1>
    <p class="mb-8 text-2xl">
      Page not found
    </p>
    <NuxtLink href="/">
      Go back
    </NuxtLink>
  </div>
</template>
