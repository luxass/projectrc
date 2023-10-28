<script setup lang="ts">
import "./styles/global.css";

useHead({
  title: "projectrc",
});

useSeoMeta({
  description: "A site that describes what a .projectrc is.",
  ogTitle: "projectrc",
  ogDescription: "A site that describes what a .projectrc is.",
});

defineOgImage({
  title: ".projectrc",
  description: "A site that describes what a .projectrc is.",
  component: "Base",
});
</script>

<template>
  <div class="md:px14 py3 md:py10">
    <NuxtPage />
  </div>
</template>
