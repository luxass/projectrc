<script setup lang="ts">
import "./styles/global.css";

useHead({
  title: "projectrc",
});

defineOgImage({
  component: "Base",
  description: "A site that describes what a .projectrc is.",
  title: ".projectrc",
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
  <div class="py3 md:px14 md:py10">
    <NuxtPage />
  </div>
</template>
