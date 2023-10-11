<script setup lang="ts">
import {
  getHighlighterCore,
} from "shikiji/core";
import { getWasmInlined } from "shikiji/wasm";

const { data: schema } = await useFetch("/api/schema");

const shiki = await getHighlighterCore({
  langs: [
    import("shikiji/langs/json.mjs"),
  ],
  themes: [
    import("shikiji/themes/vitesse-dark.mjs"),
    import("shikiji/themes/vitesse-light.mjs"),
  ],
  loadWasm: getWasmInlined,
});

const html = ref("");

useDark({
  onChanged(dark: boolean) {
    html.value = shiki.codeToHtml(JSON.stringify(schema.value, null, 2), {
      lang: "json",
      theme: dark ? "vitesse-dark" : "vitesse-light",
    });
  },
});
</script>

<template>
  <div my-4>
    <h2 text-xl my-2 font-semibold>
      You can see the schema used here.
    </h2>
    <div v-html="html" />
  </div>
</template>
