<script setup lang="ts">
useHead({
  title: "projectrc",
});

defineOgImage({
  title: "404",
  description: "Page not found",
});

useSeoMeta({
  description: "A site that describes what a .projectrc is.",
  ogTitle: "projectrc",
  ogDescription: "A site that describes what a .projectrc is.",
  twitterTitle: "projectrc",
  twitterDescription: "A site that describes what a .projectrc is.",
  ogUrl: "https://projectrc.luxass.dev",
  twitterImage: "https://projectrc.luxass.dev/__og_image__/og.png",
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
