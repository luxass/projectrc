<script setup lang="ts">
useHead({
  title: "projectrc",
});

defineOgImage({
  description: "Page not found",
  title: "404",
});

useSeoMeta({
  description: "A site that describes what a .projectrc is.",
  ogDescription: "A site that describes what a .projectrc is.",
  ogTitle: "projectrc",
  ogUrl: "https://projectrc.luxass.dev",
  twitterDescription: "A site that describes what a .projectrc is.",
  twitterImage: "https://projectrc.luxass.dev/__og_image__/og.png",
  twitterTitle: "projectrc",
});
</script>

<template>
  <div class="h-100dvh flex flex-col items-center justify-center gap-4">
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
