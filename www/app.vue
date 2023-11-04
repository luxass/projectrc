<script setup lang="ts">
import "./styles/global.css";

useHead({
  title: "projectrc",
});

defineOgImage({
  title: ".projectrc",
  description: "A site that describes what a .projectrc is.",
  component: "Base",
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
  <div class="md:px14 py3 md:py10">
    <NuxtPage />
  </div>
</template>
