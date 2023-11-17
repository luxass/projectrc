<script setup lang="ts">
import {
  getHighlighterCore,
} from "shikiji/core";
import { getWasmInlined } from "shikiji/wasm";

const schema = await $fetch("/api/schema", {
  headers: {
    "Content-Type": "application/json",
  },
  method: "GET",
});

const shiki = await getHighlighterCore({
  langs: [
    import("shikiji/langs/json.mjs"),
  ],
  loadWasm: getWasmInlined,
  themes: [
    import("shikiji/themes/vitesse-dark.mjs"),
    import("shikiji/themes/vitesse-light.mjs"),
  ],
});

const mode = useColorMode();
const isDark = computed<boolean>({
  get() {
    return mode.value === "dark";
  },
  set() {
    mode.preference = isDark.value ? "light" : "dark";
  },
});

const html = ref(shiki.codeToHtml(JSON.stringify(schema, null, 2), {
  lang: "json",
  theme: isDark.value ? "vitesse-dark" : "vitesse-light",
}));

watch(isDark, () => {
  html.value = shiki.codeToHtml(JSON.stringify(schema, null, 2), {
    lang: "json",
    theme: isDark.value ? "vitesse-dark" : "vitesse-light",
  });
});
</script>

<template>
  <div class="my-4">
    <h2 class="my-2 text-xl font-semibold">
      You can see the schema used here.
    </h2>
    <div v-html="html" />
  </div>
</template>
